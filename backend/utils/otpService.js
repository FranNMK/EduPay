/**
 * OTP Service
 * - Supports Twilio SMS if TWILIO_* env vars are set
 * - Falls back to a mock mode that logs OTP codes (development)
 */
const crypto = require('crypto');
const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFrom = process.env.TWILIO_FROM;

let client = null;
if (twilioSid && twilioToken) {
  const twilio = require('twilio');
  client = twilio(twilioSid, twilioToken);
}

const otps = new Map(); // in-memory store: phone -> { code, expiresAt }

exports.generateAndSendOtp = async (phoneNumber) => {
  const code = (Math.floor(100000 + Math.random() * 900000)).toString();
  const expiresAt = Date.now() + 5*60*1000; // 5 minutes
  otps.set(phoneNumber, { code, expiresAt });

  if (client) {
    // Send via Twilio SMS
    try {
      await client.messages.create({
        body: `Your EduPay OTP is ${code}. It expires in 5 minutes.`,
        from: twilioFrom,
        to: phoneNumber
      });
      return { success: true, method: 'twilio' };
    } catch (err) {
      console.error('Twilio send error:', err);
      return { success: false, error: err.message };
    }
  } else {
    // Mock mode (development) - log OTP on server
    console.log(`[MOCK OTP] ${phoneNumber} -> ${code}`);
    return { success: true, method: 'mock', code };
  }
};

exports.verifyOtp = (phoneNumber, code) => {
  const record = otps.get(phoneNumber);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otps.delete(phoneNumber);
    return false;
  }
  const ok = record.code === code;
  if (ok) otps.delete(phoneNumber);
  return ok;
};
