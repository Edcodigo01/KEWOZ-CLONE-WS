const { updateUser } = require("../../service/repository/user.service");
const { generalResponse } = require("../../helper/response.helper");
const updateFieldsFilter = require("../../helper/updateField.helper");
const { verifyOtp } = require("../../service/common/otp.service");
const { generateToken } = require("../../service/common/token.service");
const sanitizeUser = require("../../helper/sanitizeUser.helper");

async function OtpVerification(req, res) {
  try {
    const type = req.body.login_type;
    const otp = req.body.otp;

    if (otp == 0 || otp == "0") {
      return generalResponse(res, { success: false }, "Otp not Verified", false, true, 400);
    }

    let allowedUpdateFields = [];
    if (type == "email") {
      allowedUpdateFields = ["email", "otp"];
    } else if (type == "phone") {
      allowedUpdateFields = ["mobile_num", "otp"];
    }

    let filteredData;
    try {
      filteredData = updateFieldsFilter(req.body, allowedUpdateFields, true);
    } catch (err) {
      return generalResponse(res, { success: false }, "Data is Missing", false, true);
    }

    const isVerified = await verifyOtp(filteredData);

    if (!isVerified) {
      return generalResponse(res, { success: false }, "Otp not Verified", false, true, 400);
    }

    const token = generateToken({ user_id: isVerified.user_id });

    if (req.body.device_token) {
      await updateUser(
        { device_token: req.body.device_token },
        { user_id: isVerified.user_id }
      );
    }

    return generalResponse(
      res,
      { token, user: sanitizeUser(isVerified) },
      "Otp Verified Successfully",
      true,
      false
    );
  } catch (err) {
    console.error(err);
    return generalResponse(res, {}, err.message, false, true, 500);
  }
}

module.exports = { OtpVerification };