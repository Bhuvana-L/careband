const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { analyzeAlert, getCaregiverInsights, chatWithGemini } = require('../services/gemini');

let Patient, Alert, Location;
try { Patient = require('../models/Patient'); } catch(e) {}
try { Alert = require('../models/Alert'); } catch(e) {}
try { Location = require('../models/Location'); } catch(e) {}

// POST /api/ai/analyze-alert
router.post('/analyze-alert', async (req, res) => {
  try {
    const result = await analyzeAlert(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/insights
router.get('/insights', authMiddleware, async (req, res) => {
  try {
    let patients = [], alerts = [];
    if (Patient) patients = await Patient.find({ caregiverId: req.user.id }).lean();
    if (Alert) alerts = await Alert.find({ caregiverId: req.user.id }).sort({ time: -1 }).limit(20).lean();
    const result = await getCaregiverInsights(patients, alerts);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/chat — Chatbot endpoint
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    // Gather all context about the system for the AI
    let patients = [], alerts = [], locations = [];
    if (Patient) patients = await Patient.find({ caregiverId: req.user.id }).lean();
    if (Alert) alerts = await Alert.find().sort({ time: -1 }).limit(30).lean();
    if (Location) {
      // Get latest location for each patient
      for (const p of patients) {
        const loc = await Location.findOne({ patientId: p._id }).sort({ timestamp: -1 }).lean();
        if (loc) locations.push({ patientName: p.name, lat: loc.lat, lng: loc.lng, time: loc.timestamp });
      }
    }

    const context = {
      caregiver: { name: req.user.name, email: req.user.email, role: req.user.role },
      patients: patients.map(p => ({
        name: p.name, age: p.age, condition: p.condition,
        phone: p.phone, status: p.status,
        safeZoneRadius: p.safeZoneRadius,
        lastSeen: p.lastSeen
      })),
      recentAlerts: alerts.slice(0, 15).map(a => ({
        type: a.type, message: a.message, severity: a.severity, time: a.time
      })),
      patientLocations: locations,
      systemInfo: {
        name: 'CareBand',
        description: 'Real-time dementia care and emergency system',
        features: [
          'GPS patient tracking via phone browser',
          'Geofence safe zone monitoring with configurable radius',
          'Voice emergency detection (keywords: help, emergency, save me, doctor, fall, pain, hurt)',
          'Email SOS alerts to all caregivers via Gmail',
          'Patient tracking page - send link to patient phone for GPS sharing',
          'Editable daily routines (medication, meals, therapy)',
          'Multi-patient dashboard with Leaflet map',
          'Real-time Socket.io updates',
          'Change password and delete account in settings',
          'Google Gemini AI for insights and this chatbot'
        ],
        pages: ['Login', 'Register', 'Reset Password', 'Dashboard', 'Patients', 'Alerts', 'Voice Monitor', 'Geofence', 'Settings', 'Patient Tracking Page'],
        techStack: 'Node.js, Express, MongoDB Atlas, Socket.io, Leaflet.js, Web Speech API, Nodemailer, Google Gemini AI, Render.com'
      }
    };

    const reply = await chatWithGemini(message, context);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
