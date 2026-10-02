const { DEMO_CHAT_ID } = require("../../helper/demo_data.helper");
const chat_service = require("../../service/repository/Chat.service");

async function archive_chat(socket, data, emitEvent) {
  try {
    const user_id = socket.authData.user_id;

    if (!data.chat_id) {
      return emitEvent([socket.id], "archive_chat", "chat_id is needed.", (success = false));
    }

    const isDemoChat = process.env.IS_CLIENT != "true" && DEMO_CHAT_ID.includes(Number(data.chat_id));
    if (isDemoChat) {
      return emitEvent([socket.id], "archive_chat", "This is demo chat you can not make changes in it", (success = false));
    }

    const chat = await chat_service.getChat({ chat_id: data.chat_id });

    const isArchived = chat.dataValues.archived_for.some((id) => id == user_id);

    if (!isArchived) {
      await chat_service.updateChat(
        { archived_for: [...chat.dataValues.archived_for, user_id] },
        { chat_id: data.chat_id }
      );
    } else {
      await chat_service.updateChat(
        { archived_for: chat.dataValues.archived_for.filter((id) => id != user_id) },
        { chat_id: data.chat_id }
      );
    }

    emitEvent([socket.id], "archive_chat", {
      success: true,
      chat_id: data.chat_id,
      isArchived: !isArchived,
      message: `chat archived : ${!isArchived}`,
    });
  } catch (error) {
    throw new Error(error.message || "Failed to archive");
  }
}

module.exports = {
  archive_chat,
};
