const filterData = require("./filter.helper");

const SENSITIVE_FIELDS = ["password", "otp", "id_proof", "selfie", "device_token"];

/**
 * Removes sensitive fields from a user object before sending in API response.
 * @param {Object} user - Raw user object or dataValues
 * @returns {Object} Sanitized user object
 */
function sanitizeUser(user) {
  const data = typeof user?.toJSON === "function" ? user.toJSON() : (user?.dataValues ?? user);
  return filterData(data, SENSITIVE_FIELDS, "key");
}

module.exports = sanitizeUser;
