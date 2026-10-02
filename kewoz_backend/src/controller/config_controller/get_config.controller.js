const config_service = require("../../service/common/config.service");
const { generalResponse } = require("../../helper/response.helper");

// Force-disable Firebase Auth when config is served to the public web app
// (kewoz.com Flutter web). The admin panel still sees the real value so it
// can be re-enabled from the UI.
//
// We treat the call as "public" when:
//   - there is no auth token, AND
//   - the request comes from the Flutter web (Origin/Referer points to kewoz.com)
//
// Admin requests carry the Authorization header set by the admin panel.
function isPublicWebRequest(req) {
  const auth = req.headers?.authorization || req.headers?.Authorization;
  if (auth) return false;

  const origin =
    req.headers?.origin ||
    req.headers?.referer ||
    req.headers?.Origin ||
    req.headers?.Referer ||
    "";
  return /kewoz\.com/i.test(String(origin));
}

// Controller function to handle fetching configuration data
async function getConfig(req, res) {
  try {
    // Call the service layer to retrieve the configuration from database or source
    const config = await config_service.getConfig();

    // If no configuration is found, send a 404 response
    if (!config) {
      return generalResponse(
        res, // Response object
        {}, // Empty data object
        "Config not found", // Message
        false, // success flag
        true, // error flag
        404 // HTTP status code
      );
    }

    let responseConfig = config;
    if (isPublicWebRequest(req)) {
      // Don't expose Firebase auth to the Flutter web client; this forces
      // the app to use the backend's /api/users/verfyOtp endpoint with
      // the static 123456 OTP for admin-created test users.
      responseConfig = { ...(config?.toJSON ? config.toJSON() : config) };
      responseConfig.is_firebase_auth_enabled = false;
    }

    // If config is found, send it back with success response
    return generalResponse(
      res,
      responseConfig, // Config data
      "Config found", // Message
      true, // success flag
      false, // error flag
      200 // HTTP status code (OK)
    );
  } catch (error) {
    // Log the error for debugging
    console.error("Error in fetching Config", error);

    // Send error response with status 500 (Internal Server Error)
    return generalResponse(
      res,
      {}, // Empty data
      error.message, // Error message
      false, // success flag
      true, // error flag
      500 // HTTP status code
    );
  }
}

// Export the controller function so it can be used in routes
module.exports = {
  getConfig,
};
