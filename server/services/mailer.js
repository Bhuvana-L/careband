const nodemailer = require('nodemailer');
const dns = require('dns');

try { dns.setDefaultResultOrder('ipv4first'); } catch(e) {}

let transporter = null;
let useBrevo = false;

async function initMailer() {
  // Try Brevo API first (works on Render)
  if (process.env.BREVO_API_KEY) {
    useBrevo = true;
    console.log('✅ Email service ready (Brevo API)');
    return;
  }

  // Fall back to Gmail SMTP (works locally)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 8000
      });
      await transporter.verify();
      console.log('✅ Email service ready (Gmail SMTP)');
      return;
    } catch (e) {
      console.log('Gmail SMTP failed:', e.message);
      transporter = null;
    }
  }

  console.log('⚠️ Email service unavailable');
}

initMailer();

function buildHtml(subject, message) {
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0e1a;color:#f1f5f9;padding:30px;border-radius:16px;">
    <div style="text-align:center;margin-bottom:20px;">
      <h1 style="color:#00d4aa;margin:0;">🩺 CareBand Alert</h1>
      <p style="color:#64748b;font-size:13px;">Dementia Care Emergency System</p>
    </div>
    <div style="background:#111827;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:20px;margin-bottom:20px;">
      <h2 style="color:#ef4444;margin:0 0 10px;">⚠️ ${subject}</h2>
      <p style="color:#f1f5f9;line-height:1.6;margin:0;">${message}</p>
    </div>
    <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);border-radius:10px;padding:14px;margin-bottom:20px;">
      <p style="color:#ef4444;font-weight:bold;margin:0;">🚨 Automated alert from CareBand</p>
      <p style="color:#64748b;font-size:12px;margin:8px 0 0;">Time: ${new Date().toLocaleString()}</p>
    </div>
    <p style="color:#64748b;font-size:11px;text-align:center;">CareBand - Real-Time Dementia Care System</p>
  </div>`;
}

async function sendViaBrevo(to, subject, html) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: 'CareBand Alert', email: process.env.BREVO_SENDER || process.env.EMAIL_USER },
      to: [{ email: to }],
      subject: '🚨 CareBand: ' + subject,
      htmlContent: html
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Brevo API error');
  return data;
}

async function sendAlertEmail(to, subject, message) {
  const html = buildHtml(subject, message);

  // Try Brevo API first
  if (useBrevo && process.env.BREVO_API_KEY) {
    try {
      const result = await sendViaBrevo(to, subject, html);
      console.log('📧 Email sent via Brevo to', to);
      return { success: true, messageId: result.messageId };
    } catch (err) {
      console.error('Brevo error:', err.message);
    }
  }

  // Fall back to Gmail SMTP
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"CareBand Alert" <${process.env.EMAIL_USER}>`,
        to, subject: '🚨 CareBand: ' + subject, html
      });
      console.log('📧 Email sent via Gmail to', to, ':', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('Gmail error:', err.message);
      return { success: false, error: err.message };
    }
  }

  return { success: false, error: 'Email service not available' };
}

module.exports = { sendAlertEmail };
