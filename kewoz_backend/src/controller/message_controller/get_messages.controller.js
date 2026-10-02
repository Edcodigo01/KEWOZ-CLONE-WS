
const user_service = require("../../service/repository/user.service");
const message_service = require("../../service/repository/Message.service");
const { generalResponse } = require("../../helper/response.helper");
const { Op } = require("sequelize");
const { Message, Chat, User, Participant } = require("../../../models");

async function getMessages(req, res) {
  try {
    const userId = String(req.authData.user_id);
    const { chat_id, user_id, page = 1, pageSize = 50 } = req.body;

    // Validate input
    if (!chat_id && !user_id) {
      return generalResponse(res, [], "Chat id or user id is required", false, true, 400);
    }

    let targetChatId = chat_id;

    // If user_id is provided instead of chat_id, find/create the chat
    if (!targetChatId && user_id) {
      const participantIds = [Number(userId), Number(user_id)].sort();
      
      // Find existing chat between these two users
      const participant = await Participant.findOne({
        where: { user_id: userId },
        attributes: ["chat_id"],
        include: [{
          model: Chat,
          as: "Chat",
          where: { chat_type: "single" },
          attributes: ["chat_id"],
          include: [{
            model: Participant,
            as: "Participants",
            where: { user_id: user_id },
            attributes: [],
          }],
        }],
      });

      if (participant) {
        targetChatId = participant.chat_id;
      } else {
        return generalResponse(res, [], "No chat found", false, true, 404);
      }
    }

    if (!targetChatId) {
      return generalResponse(res, [], "Invalid chat", false, true, 400);
    }

    // Verify the user is a participant
    const isParticipant = await Participant.findOne({
      where: { chat_id: targetChatId, user_id: userId },
    });
    if (!isParticipant) {
      return generalResponse(res, [], "Invalid Chat", false, true, 403);
    }

    // Load messages
    const offset = (Number(page) - 1) * Number(pageSize);
    const { rows, count } = await Message.findAndCountAll({
      where: {
        chat_id: targetChatId,
        deleted_for_everyone: false,
      },
      order: [["createdAt", "DESC"]],
      limit: Number(pageSize),
      offset,
      include: [{
        model: User,
        attributes: ["user_id", "user_name", "full_name", "profile_pic"],
      }],
    });

    const messages = rows.map(m => ({
      message_id: m.message_id,
      message_content: m.message_content,
      message_type: m.message_type,
      message_thumbnail: m.message_thumbnail,
      sender_id: m.sender_id,
      chat_id: m.chat_id,
      is_sender: String(m.sender_id) === userId,
      created_at: m.createdAt,
      sender_name: m.User?.full_name || m.User?.user_name || "Usuario",
      message: m.message_content,
    }));

    return generalResponse(res, messages.reverse(), "Messages loaded", true, false, 200);
  } catch (error) {
    console.error("getMessages error:", error);
    return generalResponse(res, [], error.message, false, true, 500);
  }
}

module.exports = { getMessages };
