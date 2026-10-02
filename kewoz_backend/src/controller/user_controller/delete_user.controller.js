const {
  getUser,
  updateUser,
} = require("../../service/repository/user.service");
const { generalResponse } = require("../../helper/response.helper");
const config_service = require("../../service/common/config.service");
const { DEMO_USER_ID } = require("../../helper/demo_data.helper");

async function deleteUser(req, res) {
  try {
    const user_id = req.authData.user_id;
    const isDemoUser = process.env.IS_CLIENT !== "true" && DEMO_USER_ID.includes(user_id);

    if (isDemoUser) {
      return generalResponse(res, { success: false }, "User not deleted", false, true);
    }

    // Fetch user and config in parallel
    const [isUser, config] = await Promise.all([
      getUser({ user_id, deleted_at: null }),
      config_service.getConfig(),
    ]);

    if (!isUser) {
      return generalResponse(res, { success: false }, "User not found", false, true, 400);
    }

    // Soft delete: anonymize and mark deleted_at
    const deleted = await updateUser(
      {
        deleted_at: new Date(),
        user_name: null,
        email: null,
        mobile_num: null,
        profile_pic: null,
        first_name: config.app_name,
        last_name: "user",
        full_name: `${config.app_name} user`,
        device_token: null,
      },
      { user_id }
    );

    if (deleted) {
      return generalResponse(res, { success: true }, "User deleted successfully", true, true);
    }

    return generalResponse(res, {}, "Failed to delete user", false, true, 500);
  } catch (err) {
    return generalResponse(res, {}, err.message, false, true, 500);
  }
}



module.exports = {
    deleteUser
};