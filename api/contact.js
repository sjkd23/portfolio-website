/**
 * Contact Form API Endpoint
 * Vercel Serverless Function
 * Handles form submissions and sends emails via Resend
 */

export default async function handler(req, res) {
    // CORS headers (adjust origin if you want to restrict)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Allow preflight
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Parse request body
        const { fullName, email, message, botField } = req.body;

        // Honeypot spam protection - if botField is filled, silently ignore
        if (botField && botField.trim() !== '') {
            // Return success to not alert the bot
            return res.status(200).json({ ok: true });
        }

        // Validate required fields
        if (!fullName || !email || !message) {
            return res.status(400).json({
                error: 'Missing required fields. Please fill in your name, email, and message.'
            });
        }

        // Validate field lengths and content
        const trimmedName = fullName.trim();
        const trimmedEmail = email.trim();
        const trimmedMessage = message.trim();

        if (trimmedName.length < 2) {
            return res.status(400).json({
                error: 'Please enter a valid name (at least 2 characters).'
            });
        }

        if (trimmedMessage.length < 10) {
            return res.status(400).json({
                error: 'Please enter a longer message (at least 10 characters).'
            });
        }

        if (trimmedMessage.length > 5000) {
            return res.status(400).json({
                error: 'Message is too long. Please keep it under 5000 characters.'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            return res.status(400).json({
                error: 'Please enter a valid email address.'
            });
        }

        // Get environment variables
        const resendApiKey = process.env.RESEND_API_KEY;
        const contactTo = process.env.CONTACT_TO;
        const contactFrom = process.env.CONTACT_FROM || 'Contact Form <contact@dylanstauch.com>';

        if (!resendApiKey || !contactTo) {
            console.error('Missing required environment variables');
            return res.status(500).json({
                error: 'Server configuration error. Please try again later.'
            });
        }

        // Prepare email content
        const emailSubject = `New message from ${trimmedName}`;
        const emailBody = `
You have received a new message from your portfolio website:

Name: ${trimmedName}
Email: ${trimmedEmail}

Message:
${trimmedMessage}

---
This message was sent from your portfolio contact form.
        `.trim();

        // Send email via Resend API
        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: contactFrom,
                to: contactTo,
                reply_to: trimmedEmail,
                subject: emailSubject,
                text: emailBody
            })
        });

        if (!resendResponse.ok) {
            const errorData = await resendResponse.text().catch(() => 'Unknown error');
            console.error('Resend API error:', resendResponse.status, errorData);
            return res.status(502).json({
                error: 'Failed to send email. Please try again later.'
            });
        }

        // Success response
        return res.status(200).json({ ok: true });

    } catch (error) {
        console.error('Contact form error:', error);
        return res.status(500).json({
            error: 'Internal server error. Please try again later.'
        });
    }
}
