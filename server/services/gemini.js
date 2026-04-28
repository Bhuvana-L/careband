const { GoogleGenerativeAI } = require('@google/generative-ai');

let model = null;

function initGemini() {
  if (!process.env.GEMINI_API_KEY) {
    console.log('⚠️  GEMINI_API_KEY not set — AI features disabled');
    return;
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  console.log('✅ Google Gemini AI ready');
}

async function analyzeAlert(alertData) {
  if (!model) return { analysis: 'AI not configured', risk: 'unknown', recommendation: 'Set up Gemini API key for AI analysis' };

  const prompt = `You are a dementia care AI assistant. Analyze this patient alert and provide a brief JSON response.

Alert: ${JSON.stringify(alertData)}

Respond ONLY with valid JSON in this format:
{
  "risk": "low|medium|high|critical",
  "analysis": "Brief 1-2 sentence analysis of the situation",
  "recommendation": "Brief actionable recommendation for the caregiver",
  "urgency": "immediate|soon|routine"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return { analysis: text, risk: 'unknown', recommendation: 'Check on patient' };
  } catch (err) {
    console.error('Gemini error:', err.message);
    return { analysis: 'AI analysis unavailable', risk: 'unknown', recommendation: 'Manual review needed' };
  }
}

async function getCaregiverInsights(patients, recentAlerts) {
  if (!model) return { insights: 'Configure Gemini API for AI insights' };

  const prompt = `You are a dementia care AI assistant. Based on the following patient data and recent alerts, provide brief caregiver insights.

Patients: ${JSON.stringify(patients.map(p => ({ name: p.name, age: p.age, condition: p.condition, status: p.status })))}
Recent Alerts (last 24h): ${JSON.stringify(recentAlerts.slice(0, 10).map(a => ({ type: a.type, message: a.message, severity: a.severity })))}

Respond ONLY with valid JSON:
{
  "summary": "Brief overall status summary",
  "concerns": ["List of concerns if any"],
  "recommendations": ["List of 2-3 actionable recommendations"],
  "wellnessTip": "A brief wellness tip for the caregiver"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return { summary: text };
  } catch (err) {
    return { summary: 'AI insights unavailable', recommendations: ['Check on all patients regularly'] };
  }
}

module.exports = { initGemini, analyzeAlert, getCaregiverInsights };
