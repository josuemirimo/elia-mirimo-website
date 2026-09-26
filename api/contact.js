function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const { name, organisation, email, enquiryType, message } = req.body || {};
  const cleanName = String(name || '').trim();
  const cleanOrganisation = String(organisation || '').trim();
  const cleanEmail = String(email || '').trim();
  const cleanType = String(enquiryType || '').trim();
  const cleanMessage = String(message || '').trim();

  if (!cleanName || !cleanEmail || !cleanType || cleanMessage.length < 10) {
    return res.status(400).json({ message: 'Please complete all required fields.' });
  }

  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.RESEND_TO_EMAIL;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !toEmail || !fromEmail) {
    console.error('Missing Resend environment variables.');
    return res.status(500).json({ message: 'Email service is not configured yet.' });
  }

  const safeMessage = escapeHtml(cleanMessage).replace(/\r?\n/g, '<br>');
  const html = `
    <div style="font-family:sans-serif;max-width:560px;color:#111;">
      <div style="background:#080c14;padding:20px 24px;border-radius:8px 8px 0 0;">
        <h2 style="color:#00f0ff;margin:0;font-size:18px;">New Scouting Enquiry — Elia Mirimo</h2>
      </div>
      <div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#64748b;width:130px;">Name</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(cleanName)}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Organisation</td><td style="padding:8px 0;">${escapeHtml(cleanOrganisation || '—')}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Email</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(cleanEmail)}">${escapeHtml(cleanEmail)}</a></td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Enquiry Type</td><td style="padding:8px 0;font-weight:600;color:#7c3aed;">${escapeHtml(cleanType)}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;">
        <p style="color:#64748b;font-size:13px;margin:0 0 8px;">Message</p>
        <p style="font-size:14px;line-height:1.7;margin:0;">${safeMessage}</p>
      </div>
    </div>`;

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: cleanEmail,
        subject: `Scouting Enquiry: ${cleanType} — from ${cleanName}`,
        html
      })
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.json().catch(() => ({}));
      console.error('Resend error:', error);
      return res.status(502).json({ message: 'The email service could not send your message.' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return res.status(500).json({ message: 'Could not send your message right now.' });
  }
};
