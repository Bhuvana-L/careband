const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { analyzeAlert, getCaregiverInsights } = require('../services/gemini');

let Patient, Alert;
try { Patient = require('../models/Patient'); } catch(e) {}
try { Alert = require('../models/Alert'); } catch(e) {}

// POST /api/ai/analyze-alert
router.post('/analyze-alert', async (req, res) => {
  try {
    const result = await analyzeAlert(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/insights — Get AI-powered caregiver insights
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

module.exports = router;
