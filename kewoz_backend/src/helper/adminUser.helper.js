// Helper to detect if a phone number is an admin-created test number
// (country code + "01" + 8 digits pattern used by admin panel)

function isAdminOtpPattern(country_code, mobile_num) {
  if (!country_code || !mobile_num) return false;
  // Extract digits from country code (e.g., "+58" -> "58")
  const cc = String(country_code).replace(/\D/g, '');
  if (!cc) return false;
  // Strip non-digits from mobile_num to be safe
  const num = String(mobile_num).replace(/\D/g, '');
  // Pattern: <cc> + "01" + at least 1 more digit
  // Examples: +58 01XXXXXXXX, +1 01XXXXXXXX, +10 10000000
  return num.startsWith(cc + '01') && num.length > cc.length + 2;
}

module.exports = { isAdminOtpPattern };
