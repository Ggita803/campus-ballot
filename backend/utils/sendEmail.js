
const axios = require('axios');

/**
 * Send transactional email using Brevo HTTP API (Render-compatible)
 * 
 * Setup Instructions:
 * 1. Create account at https://www.brevo.com
 * 2. Go to SMTP & API section
 * 3. Create API key (not SMTP key)
 * 4. Update .env with API key as EMAIL_PASS
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'Campus Ballot',
          email: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        },
        to: [
          {
            email: to,
            name: to.split('@')[0], // Use part before @ as name
          },
        ],
        subject: subject,
        htmlContent: html,
      },
      {
        headers: {
          'api-key': process.env.EMAIL_PASS, // Brevo API key
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('[EMAIL SENT VIA API]:', {
      to,
      messageId: response.data.messageId,
      status: 'success'
    });
    
    return response.data;
  } catch (error) {
    console.error('[EMAIL API ERROR]:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw new Error('Email could not be sent via API');
  }
};

module.exports = sendEmail;
