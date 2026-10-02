const {
  createUser,
  getUser,
  updateUser,
} = require("../../service/repository/user.service");
const { generalResponse } = require("../../helper/response.helper");
const updateFieldsFilter = require("../../helper/updateField.helper");
const {
  sendEmailOTP,
  generateOTP,
  sendTwilioOTP,
  sendMesg91TP,
} = require("../../service/common/otp.service");
const { generateToken } = require("../../service/common/token.service");
const filterData = require("../../helper/filter.helper");
const process = require("process");
const config_service = require("../../service/common/config.service");
const { isAdminOtpPattern } = require("../../helper/adminUser.helper");

const SENSITIVE_KEYS = ["password", "otp", "id_proof", "selfie", "device_token"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getClientIp(req) {
  let ip =
    req.headers["x-forwarded-for"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.connection?.socket?.remoteAddress;

  if (ip?.includes("::ffff:")) ip = ip.split("::ffff:")[1];
  if (ip?.includes(",")) ip = ip.split(",")[0].trim();
  return ip;
}

function generateOtp() {
  return process.env.NODE_ENV === "development" ? 123456 : generateOTP();
}

function buildSocialToken(user) {
  return generateToken({
    user_id: user.user_id,
    email: user.email,
    user_name: user.user_name,
    login_type: user.login_type,
  });
}

async function sendPhoneOtp(country_code, mobile_num, otp) {
  if (country_code === "+91" && process.env.IS_MSG91_ENABLED === "true") {
    return sendMesg91TP(country_code, mobile_num, otp);
  }
  if (process.env.IS_TWILIO_ENABLED === "true") {
    return sendTwilioOTP(country_code, mobile_num, otp);
  }
  return null; // no OTP service enabled
}

// ─── Login type config ────────────────────────────────────────────────────────

const LOGIN_TYPE_CONFIG = {
  email: {
    configKey: "email_authentication",
    configError: "Not accepting authentication through email, try other ways.",
    fields: ["email", "login_type", "platform"],
    mandatory: true,
  },
  phone: {
    configKey: "phone_authentication",
    configError: "Not accepting authentication through phone, try other ways.",
    fields: ["mobile_num", "country_code", "login_type", "country_short_name", "country", "platform"],
    mandatory: true,
  },
  social: {
    configKey: null,
    fields: ["email", "login_type", "device_token", "first_name", "last_name", "platform"],
    mandatory: true,
  },
};

// ─── Main Controller ──────────────────────────────────────────────────────────

async function signupUser(req, res) {
  try {
    const type = req.body.login_type || "phone";

    const typeConfig = LOGIN_TYPE_CONFIG[type];
    if (!typeConfig) {
      return generalResponse(res, {}, "Invalid login type", false, true, 422);
    }

    // ⚙️ Fetch config and generate OTP
    const [config] = await Promise.all([config_service.getConfig()]);
    const otp = generateOtp();

    // Check if login type is enabled in config
    if (typeConfig.configKey && !config[typeConfig.configKey]) {
      return generalResponse(res, {}, typeConfig.configError, false, true, 400);
    }

    // Validate and filter request fields
    let filteredData;
    try {
      if (type === "social") req.body.login_verification_status = true;
      filteredData = updateFieldsFilter(req.body, typeConfig.fields, typeConfig.mandatory);
    } catch (err) {
      return generalResponse(res, {}, err.message, false, true, 400);
    }

    // Add IP for phone signup
    if (type === "phone") {
      filteredData.ip_address = getClientIp(req);
    }

    // Find existing user
    const userQuery = type === "phone"
      ? { mobile_num: filteredData.mobile_num, country_code: filteredData.country_code }
      : type === "social"
        ? { ...filteredData }
        : { email: filteredData.email };

    const isUser = await getUser(userQuery);

    // ── NEW USER ──────────────────────────────────────────────────────────────
    if (!isUser) {
      // Check if this is an admin-OTP number (country_code + "01" + 8 digits)
      const isAdminOtp = type === "phone" && isAdminOtpPattern(filteredData.country_code, filteredData.mobile_num);

      if (isAdminOtp) {
        filteredData.otp = 123456;
        filteredData.is_admin_otp_user = true;
        filteredData.mobile_num_is_test = true;
      } else {
        filteredData.otp = otp;
      }

      const platforms = [filteredData.platform];
      delete filteredData.platform;
      const allowedTypes = ["regular", "business"];
      if (req.body.user_type && allowedTypes.includes(req.body.user_type)) {
          filteredData.user_type = req.body.user_type;
      }
      const newUser = await createUser({ ...filteredData, platforms });

      if (type === "email") {
        const sendOtp = await sendEmailOTP(req.body.email, otp);
        if (!sendOtp) return generalResponse(res, {}, "Failed to send OTP on email", false, true);
        return generalResponse(res, { newUser: true }, "OTP Sent Successfully", true, true);
      }

      if (type === "phone") {
        if (isAdminOtp) {
          // Skip SMS sending for admin-OTP users
          return generalResponse(res, {
            newUser: true,
            is_admin_otp_user: true,
            message_type: 'admin_otp'
          }, "Ingrese OTP de usuario creado por admin", true, true);
        }
        const sendOtp = await sendPhoneOtp(newUser.dataValues.country_code, newUser.dataValues.mobile_num, otp);
        if (sendOtp === null) return generalResponse(res, {}, "No OTP service is enabled", false, true);
        if (!sendOtp) return generalResponse(res, { newUser: true }, "Failed to send OTP", false, true);
        return generalResponse(res, { newUser: true }, "OTP Sent Successfully", true, true);
      }

      if (type === "social") {
        const token = await buildSocialToken(newUser);
        return generalResponse(res, { token, user: newUser, newUser: true }, "User signed up!", true, true);
      }

      const user = filterData(newUser, SENSITIVE_KEYS, "key");
      return generalResponse(res, user, "SignUp Successfully!", true, true);
    }

    // ── EXISTING USER ─────────────────────────────────────────────────────────




// Default user_type = regular if not provided
const requestedType = req.body.user_type || "regular";

// Check mismatch
if (isUser.user_type !== requestedType) {
  return generalResponse(
    res,
    {},
    `You are ${isUser.user_type} user, please login with ${isUser.user_type} app`,
    false,
    true,
  );
}

    // Blocked user check
    if (isUser.bloked_by_admin) {
      return generalResponse(res, {}, "User is blocked by admin", false, true);
    }

    // Update platforms (fire-and-forget) — guard against null/non-array platforms
    const existingPlatforms = Array.isArray(isUser.platforms) ? isUser.platforms : [];
    const updatedPlatforms = Array.from(
      new Set([...existingPlatforms, filteredData.platform].filter(Boolean))
    );
    updateUser({ platforms: updatedPlatforms }, { user_id: isUser.user_id });

    if (type === "social") {
      const token = await buildSocialToken(isUser);
      return generalResponse(res, { token, user: isUser, newUser: false }, "User Already Exists!", false, true);
    }

    if (type === "email") {
      const [sendOtp, updated] = await Promise.all([
        sendEmailOTP(req.body.email, otp),
        updateUser({ otp }, { user_id: isUser.user_id }),
      ]);
      const newUser = !isUser.login_verification_status;
      if (!sendOtp || !updated) return generalResponse(res, {}, "Failed to send OTP on email", false, true);
      return generalResponse(res, { newUser }, "OTP Sent Successfully", true, true);
    }

    if (type === "phone") {
      // Detect admin-OTP user: either marked in DB or matches the cc+01 pattern
      const isAdminOtp = isUser.is_admin_otp_user ||
        isAdminOtpPattern(isUser.country_code, isUser.mobile_num);

      if (isAdminOtp) {
        // Set OTP to 123456 and ensure flag is set
        await updateUser({
          otp: 123456,
          is_admin_otp_user: true,
          mobile_num_is_test: true
        }, { user_id: isUser.user_id });
        return generalResponse(res, {
          newUser: !isUser.login_verification_status,
          is_admin_otp_user: true,
          message_type: 'admin_otp'
        }, "Ingrese OTP de usuario creado por admin", true, true);
      }

      const newUser = !isUser.login_verification_status;
      const [sendOtp, updated] = await Promise.all([
        sendPhoneOtp(isUser.country_code, isUser.mobile_num, otp),
        updateUser({ otp }, { user_id: isUser.user_id }),
      ]);
      if (sendOtp === null) return generalResponse(res, {}, "No OTP service is enabled", false, true);
      if (!sendOtp || !updated) return generalResponse(res, { newUser }, "Failed to send OTP", false, true);
      return generalResponse(res, { newUser }, "OTP Sent Successfully", true, true);
    }

    return generalResponse(res, {}, "User Already Exists!", false, false);

  } catch (error) {
    console.error("Error in SignUp", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      const field = error.errors[0].path;
      return generalResponse(res, {}, `${field} already exists`, false, true, 409);
    }
    return generalResponse(res, {}, error.message, false, true);
  }
}

module.exports = { signupUser };
