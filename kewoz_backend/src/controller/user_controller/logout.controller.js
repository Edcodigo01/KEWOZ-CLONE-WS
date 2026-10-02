const { generalResponse } = require("../../helper/response.helper");
const { disconnectSocketById } = require("../../service/common/socket.service");
const { updateUser } = require("../../service/repository/user.service");

async function logout(req, res) {
  try {
    const user_id = req.authData.user_id;

    // Clear device_token and disconnect socket in parallel
    await Promise.all([
      updateUser({ device_token: null }, { user_id }),
      Promise.resolve(disconnectSocketById(req.body.socket_id)),
    ]);

    return generalResponse(res, { success: true }, "Logout successfully", true, true);
  } catch (err) {
    return generalResponse(res, {}, err.message, false, true, 500);
  }
}


module.exports = {
  logout
};  
