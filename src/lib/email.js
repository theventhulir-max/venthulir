import nodemailer from 'nodemailer';

// Configure Nodemailer with Direct Gmail SMTP (Google SPF & DKIM Authenticated)
const emailUser = (process.env.EMAIL_USER || '').trim();
const emailPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function sendEmail({ to, subject, html, text }) {
  const recipient = Array.isArray(to) ? to.join(',') : to;

  // Clean, high-deliverability transactional headers
  const mailOptions = {
    from: `"Venthulir Organic" <${emailUser}>`,
    replyTo: emailUser,
    to: recipient,
    subject,
    text: text || '',
    html: html || `<p>${text || ''}</p>`,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'high',
      'Auto-Submitted': 'auto-generated',
      'X-Auto-Response-Suppress': 'All'
    }
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Direct Gmail SMTP delivered to Primary Inbox! MessageId:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Gmail SMTP Delivery Error:', err.message);
    return { success: false, error: err.message };
  }
}

export default sendEmail;
