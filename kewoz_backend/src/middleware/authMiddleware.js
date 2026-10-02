const jwt = require("jsonwebtoken");
const user_service = require("../service/repository/user.service");
const { generalResponse } = require("../helper/response.helper");
const {
  getParticipantWithoutPagenation,
} = require("../service/repository/Participant.service");
const { User } = require("../../models");
const { emitEvent, disconnectSocketById } = require("../service/common/socket.service");
const sanitizeUser = require("../helper/sanitizeUser.helper");
const {
  initial_onlineList,
} = require('../controller/chat_controller/initial_online_list.socket.controller');
const admin_service = require("../service/repository/Admin.service");

const JWT_SECRET = process.env.screteKey;

const SOCKET_USER_ATTRIBUTES = [
  "profile_pic", "user_id", "full_name", "user_name", "email",
  "country_code", "country", "gender", "description",
  "profile_verification_status", "login_verification_status", "socket_ids",
];

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(403).json({ success: false, error: "No credentials sent!" });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ success: false, error: "Invalid token!" });
  }

  try {
    req.authData = jwt.verify(token, JWT_SECRET);

    if (req.authData?.user_id) {
      const isUser = await user_service.getUser({
        user_id: req.authData.user_id,
        deleted_at: null,
      });

      if (!isUser) {
        return generalResponse(res, {}, "User not found.", false, true, 401);
      }
      if (isUser.blocked_by_admin) {
        return generalResponse(res, {}, "User is blocked by admin", false, true, 401);
      }

      // Update last_login and platforms in one call; build updated user from existing data
      const platform = req.headers["x-platform"];
      const updatedPlatforms = isUser.platforms.includes(platform)
        ? isUser.platforms
        : [...isUser.platforms, platform];

      await user_service.updateUser(
        { last_login: new Date(), platforms: updatedPlatforms },
        { user_id: req.authData.user_id }
      );

      // Reuse the already-fetched user, apply the platform update locally — avoid second DB call
      req.user = { ...isUser.toJSON(), platforms: updatedPlatforms };
    }

    if (req.authData?.admin_id) {
      const is_admin = await admin_service.getAdmin({ admin_id: req.authData.admin_id });
      if (!is_admin) {
        return generalResponse(res, {}, "No Admin found", false, true, 401);
      }
      req.adminData = is_admin.toJSON();
      req.user_type = "admin";
    }
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Invalid token!", success: false });
  }

  next();
}

const soketAuthMiddleware = async (socket, next) => {
  const authToken = socket.handshake.headers["token"] || socket.handshake.auth.token;

  if (!authToken) {
    return next(new Error("Missing token during connection."));
  }

  try {
    const authData = jwt.verify(authToken, JWT_SECRET);
    socket.authData = { user_id: authData.user_id };

    const isUser = await user_service.getUser({
      user_id: socket.authData.user_id,
      deleted_at: null,
    });

    if (!isUser) {
      disconnectSocketById(socket.id);
      return next(new Error("User not found."));
    }

    // Build sanitized user_data for online broadcast
    const user_data = { ...sanitizeUser(isUser), isOnline: true };

    // Update socket_ids immediately, then call next() to unblock the connection
    await user_service.updateUser(
      { socket_ids: [...(Array.isArray(isUser.socket_ids) ? isUser.socket_ids : []), socket.id] },
      { user_id: socket.authData.user_id }
    );

    // Let the socket connect immediately — do not block on heavy DB work
    next();

    // Notify online users and send initial online list in background (after connection established)
    try {
      const getChats_of_users = await getParticipantWithoutPagenation({ user_id: socket.authData.user_id });

      if (getChats_of_users.Records.length > 0) {
        const includeOptions = [{
          model: User,
          as: "User",
          attributes: SOCKET_USER_ATTRIBUTES,
        }];

        const chatIds = getChats_of_users.Records.map((c) => c.chat_id);
        const emitted = new Set();

        const allParticipants = await Promise.all(
          chatIds.map((chat_id) => getParticipantWithoutPagenation({ chat_id }, includeOptions))
        );

        for (const { Records } of allParticipants) {
          for (const chat of Records) {
            if (chat.user_id !== socket.authData.user_id && !emitted.has(chat.user_id)) {
              emitEvent(chat.User.socket_ids, "online_user", user_data);
              emitted.add(chat.user_id);
            }
          }
        }
      }

      initial_onlineList(socket, emitEvent);
    } catch (bgError) {
      console.error("Error in post-connect socket setup:", bgError);
    }
  } catch (error) {
    console.error("Token verification or user handling error:", error);
    return next(new Error("Invalid token."));
  }
};


const authorize = (allowedRoles) => (req, res, next) => {
  const userRole = req.user?.user_type;
  if (!userRole || !allowedRoles.includes(userRole)) {
    return generalResponse(res, {}, "You are not authorized to perform this action", false, true, 403);
  }
  next();
};

module.exports = { authMiddleware, soketAuthMiddleware, authorize };
