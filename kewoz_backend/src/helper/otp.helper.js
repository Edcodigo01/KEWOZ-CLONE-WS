const {
  sendEmailOTP,
  sendTwilioOTP,
  sendMesg91TP,
} = require("../service/common/otp.service");

/**
 * Sends OTP via email.
 * @param {string} email
 * @param {string|number} otp
 * @returns {Promise<boolean>}
 */
async function sendOtpByEmail(email, otp) {
  return sendEmailOTP(email, otp);
}

/**
 * Sends OTP via phone using Msg91 (India +91) or Twilio.
 * Falls back gracefully if no service is enabled.
 *
 * @param {string} country_code - e.g. "+91"
 * @param {string} mobile_num
 * @param {string|number} otp
 * @returns {Promise<boolean|null>} true/false on send result, null if no service enabled
 */
async function sendOtpByPhone(country_code, mobile_num, otp) {
  if (country_code == "+91" && process.env.IS_MSG91_ENABLED == "true") {
    return sendMesg91TP(country_code, mobile_num, otp);
  } else if (process.env.IS_TWILIO_ENABLED == "true") {
    return sendTwilioOTP(country_code, mobile_num, otp);
  }
  return null; // No OTP service is enabled
}

module.exports = { sendOtpByEmail, sendOtpByPhone };
