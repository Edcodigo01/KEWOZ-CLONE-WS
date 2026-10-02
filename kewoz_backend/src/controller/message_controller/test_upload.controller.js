
const { generalResponse } = require("../../helper/response.helper");

async function testUpload(req, res) {
  try {
    const user_id = req.authData.user_id;
    const files = req.files || [];
    return generalResponse(res, {
      user_id: user_id,
      file_count: files.length,
      file_path: files.length > 0 ? files[0].path : null,
      body_fields: Object.keys(req.body),
    }, "Test OK", true, false, 200);
  } catch (error) {
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}

module.exports = { testUpload };
