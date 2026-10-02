const participant_service = require("../../service/repository/Participant.service");
const message_service = require("../../service/repository/Message.service");
const chat_service = require("../../service/repository/Chat.service");
const { generalResponse } = require("../../helper/response.helper");
const { Sequelize } = require("sequelize");
const { DEMO_CHAT_ID } = require("../../helper/demo_data.helper");

async function clearChat(req, res) {
  try {
    const chat_id = req.body.chat_id;
    const user_id = req.authData.user_id;
    const delete_chat = req.body.delete_chat || false;

    if (!chat_id) {
      return generalResponse(res, {}, "chat_id is required");
    }

    const isDemoChat = process.env.IS_CLIENT != "true" && DEMO_CHAT_ID.includes(Number(chat_id));
    if (isDemoChat) {
      return generalResponse(res, {}, "This is demo chat you can not make changes in it", false, true);
    }

    // Check if user is a participant of the chat
    const participant = await participant_service.getParticipant({ user_id, chat_id });
    if (!participant) {
      return generalResponse(res, {}, "You're not a member of this group.", true, false, 402);
    }

    // Mark all messages as deleted for this user (soft delete)
    await message_service.updateMessage(
      { chat_id },
      { deleted_for: Sequelize.literal(`array_append("deleted_for", ${user_id})`) }
    );

    if (delete_chat) {
      await chat_service.updateChat(
        { deleted_for: Sequelize.literal(`array_append("deleted_for", ${user_id})`) },
        { chat_id }
      );
    } else {
      await chat_service.updateChat(
        { cleared_for: Sequelize.literal(`array_append("cleared_for", ${user_id})`) },
        { chat_id }
      );
    }

    return generalResponse(res, {}, "Chat cleared successfully!!", true, true);
  } catch (error) {
    return generalResponse(res, {}, error.message, false, true, 402);
  }
}

module.exports = {
  clearChat,
};
