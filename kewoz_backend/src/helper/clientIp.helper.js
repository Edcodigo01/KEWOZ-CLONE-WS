/**
 * Extracts the real client IP address from an Express request.
 * Handles proxies, IPv6-mapped IPv4, and multi-IP x-forwarded-for headers.
 * @param {Object} req - Express request object
 * @returns {string|undefined} Client IP address
 */
function getClientIp(req) {
  let ip =
    req.headers["x-forwarded-for"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.connection?.socket?.remoteAddress;

  if (ip && ip.includes("::ffff:")) {
    ip = ip.split("::ffff:")[1];
  }

  if (ip && ip.includes(",")) {
    ip = ip.split(",")[0].trim();
  }

  return ip;
}

module.exports = getClientIp;
