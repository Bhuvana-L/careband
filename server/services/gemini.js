const { GoogleGenerativeAI } = require('@google/generative-ai');

let model = null;
let genAI = null;

function initGemini() {
  if (!process.env.GEMINI_API_KEY) {
    console.log('⚠️  GEMINI_API_KEY not set — AI features disabled');
    return;
  }
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('✅ Google Gemini AI ready');
  } catch (err) {
    console.error('Gemini init error:', err.message);
    // Try older model name
    try {
      model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      console.log('✅ Google Gemini AI ready (1.5-flash)');
    } catch (e) {
      console.error('Gemini fallback error:', e.message);
    }
  }
}

async function analyzeAlert(alertData) {
  if (!model) return { analysis: 'AI not configured', risk: 'unknown', recommendation: 'Add GEMINI_API_KEY' };
  try {
    const prompt = 'You are a dementia care AI. Analyze this alert briefly in JSON format {risk, analysis, recommendation}: ' + JSON.stringify(alertData);
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    return { analysis: text, risk: 'unknown', recommendation: 'Check patient' };
  } catch (err) {
    console.error('Gemini analyzeAlert error:', err.message);
    return { analysis: 'Error', risk: 'unknown', recommendation: err.message };
  }
}

async function getCaregiverInsights(patients, recentAlerts) {
  if (!model) return { insights: 'Add GEMINI_API_KEY for AI insights' };
  try {
    const pList = (patients || []).map(p => (p.name || 'Unknown') + ' age ' + (p.age || '?')).join(', ');
    const aList = (recentAlerts || []).slice(0, 5).map(a => (a.type || '') + ': ' + (a.message || '')).join('; ');
    const prompt = 'You are a dementia care AI. Give brief caregiver insights as JSON {summary, concerns:[], recommendations:[], wellnessTip}. Patients: ' + (pList || 'none') + '. Recent alerts: ' + (aList || 'none');
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    return { summary: text };
  } catch (err) {
    console.error('Gemini insights error:', err.message);
    return { summary: 'Could not get insights: ' + err.message };
  }
}

async function chatWithGemini(userMessage, context) {
  if (!model) return 'AI chatbot is not configured. Please add GEMINI_API_KEY to environment variables.';

  try {
    // Build a safe, compact context string
    const caregiver = context.caregiver || {};
    const patients = context.patients || [];
    const alerts = context.recentAlerts || [];
    const locations = context.patientLocations || [];
    const features = (context.systemInfo && context.systemInfo.features) || [];

    let systemInfo = 'You are CareBand AI assistant for a dementia care system. Be helpful, warm, concise (under 150 words).\n\n';
    systemInfo += 'CAREBAND FEATURES: ' + features.join(', ') + '\n\n';
    systemInfo += 'CAREGIVER: ' + (caregiver.name || 'Unknown') + ' (' + (caregiver.email || '') + ')\n\n';

    if (patients.length > 0) {
      systemInfo += 'PATIENTS (' + patients.length + '):\n';
      patients.forEach(p => {
        systemInfo += '- ' + (p.name||'?') + ', Age ' + (p.age||'?') + ', ' + (p.condition||'Dementia') + ', Status: ' + (p.status||'unknown') + ', Phone: ' + (p.phone||'N/A') + '\n';
      });
    } else {
      systemInfo += 'PATIENTS: None added yet\n';
    }

    if (locations.length > 0) {
      systemInfo += '\nLOCATIONS:\n';
      locations.forEach(l => {
        const lat = typeof l.lat === 'number' ? l.lat.toFixed(4) : '?';
        const lng = typeof l.lng === 'number' ? l.lng.toFixed(4) : '?';
        systemInfo += '- ' + (l.patientName||'?') + ': ' + lat + ', ' + lng + '\n';
      });
    }

    if (alerts.length > 0) {
      systemInfo += '\nRECENT ALERTS:\n';
      alerts.slice(0, 10).forEach(a => {
        systemInfo += '- [' + (a.severity||'?') + '] ' + (a.type||'?') + ': ' + (a.message||'') + '\n';
      });
    }

    const fullPrompt = systemInfo + '\nUser question: ' + userMessage;

    const result = await model.generateContent(fullPrompt);
    const reply = result.response.text().trim();
    return reply || 'I could not generate a response. Please try again.';
  } catch (err) {
    console.error('Gemini chat error:', err.message);
    // Return the actual error so we can debug
    if (err.message.includes('API_KEY')) return 'API key issue: ' + err.message;
    if (err.message.includes('quota')) return 'API quota exceeded. Please try again later.';
    if (err.message.includes('not found')) return 'AI model not available. The API key may need the Gemini API enabled in Google Cloud Console.';
    return 'Error: ' + err.message;
  }
}

module.exports = { initGemini, analyzeAlert, getCaregiverInsights, chatWithGemini };
