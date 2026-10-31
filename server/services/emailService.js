
import { env } from '../config/env.js';

export const sendOtpEmail = async (email, otp) => {
  if (!env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured.');
  }

  if (!env.RESEND_FROM) {
    throw new Error('RESEND_FROM is not configured.');
  }

  if (!email || !otp) {
    throw new Error('Recipient email and OTP are required.');
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 12000);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: env.RESEND_FROM,
        to: [email],
        subject: 'Your Banking Portal Verification Code',
        text: `Your verification code is ${otp}. It expires in 5 minutes. If you did not request this code, contact your bank administrator.`
      }),
      signal: controller.signal
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('OTP email provider error:', {
        status: response.status,
        message: result.message || result.name || 'Email delivery failed'
      });

      throw new Error(
        result.message || 'Unable to send verification email.'
      );
    }

    console.log('OTP email accepted by email provider.');

    return result;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('OTP email request timed out.');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};
