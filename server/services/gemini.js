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

async function chatWithGemini(userMessage, context) {
  if (!model) return 'AI chatbot is not configured. Please add GEMINI_API_KEY to environment variables.';

  const systemPrompt = `You are CareBand AI, a friendly and knowledgeable assistant for the CareBand dementia care system. You know EVERYTHING about this system and the caregiver's data.

SYSTEM INFORMATION:
${JSON.stringify(context.systemInfo, null, 2)}

CURRENT CAREGIVER:
Name: ${context.caregiver.name}, Email: ${context.caregiver.email}, Role: ${context.caregiver.role}

PATIENTS (${context.patients.length} total):
${context.patients.length > 0 ? context.patients.map(p => `- ${p.name}, Age ${p.age}, ${p.condition}, Phone: ${p.phone}, Status: ${p.status}, Safe Zone: ${p.safeZoneRadius}m`).join('\n') : 'No patients added yet.'}

PATIENT LOCATIONS:
${context.patientLocations.length > 0 ? context.patientLocations.map(l => `- ${l.patientName}: ${l.lat.toFixed(4)}, ${l.lng.toFixed(4)} (${l.time})`).join('\n') : 'No location data yet.'}

RECENT ALERTS (${context.recentAlerts.length}):
${context.recentAlerts.length > 0 ? context.recentAlerts.map(a => `- [${a.severity}] ${a.type}: ${a.message} (${a.time})`).join('\n') : 'No alerts yet.'}

RULES:
- Be helpful, warm, and concise
- Answer questions about patients, alerts, features, how things work
- Give care advice when asked
- If asked about a specific patient, use the real data above
- If asked how to do something in CareBand, explain the steps
- Keep responses under 150 words
- Use emojis sparingly for friendliness
- If you don't know something specific, say so honestly`;

  try {
    const result = await model.generateContent(systemPrompt + '\n\nUser: ' + userMessage);
    return result.response.text().trim();
  } catch (err) {
    console.error('Gemini chat error:', err.message);
    return 'Sorry, I had trouble processing that. Please try again.';
  }
}

module.exports = { initGemini, analyzeAlert, getCaregiverInsights, chatWithGemini };
