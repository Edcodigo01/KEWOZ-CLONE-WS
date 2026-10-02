const { DEMO_CHAT_ID } = require("../../helper/demo_data.helper");
const message_service = require("../../service/repository/Message.service");
const { chat_list } = require("../chat_controller/chat_list.socket.controller");

async function delete_for_me(socket, data, emitEvent) {
  try {
    if (!data.message_id || !data.chat_id) {
      return emitEvent([socket.id], "delete_for_me", "Message id and chat id is required.", (success = false));
    }

    const isDemoChat = process.env.IS_CLIENT != "true" && DEMO_CHAT_ID.includes(Number(data.chat_id));
    if (isDemoChat) {
      return emitEvent([socket.id], "delete_for_me", "This is demo chat you can not make changes in it", (success = false));
    }

    const user_id = socket.authData.user_id;
    const message = await message_service.getMessage(data);

    if (!message) {
      return emitEvent([socket.id], "delete_for_me", "Message not found.", (success = false));
    }

    const alreadyDeleted = message.deleted_for.includes(user_id.toString());
    if (alreadyDeleted) {
      return emitEvent([socket.id], "delete_for_me", "Message Already deleted.");
    }

    await message_service.updateMessage(
      { message_id: Number(data.message_id) },
      { deleted_for: [...message.deleted_for, user_id.toString()] }
    );

    emitEvent([socket.id], "delete_for_me", "Message deleted successfully.");

    // ✅ CHAT LIST UPDATE
    await chat_list(socket, {}, emitEvent);

  } catch (err) {
    return emitEvent([socket.id], "delete_for_me", "Error in deleting message.", (success = false));
  }
}

module.exports = {
  delete_for_me,
};
