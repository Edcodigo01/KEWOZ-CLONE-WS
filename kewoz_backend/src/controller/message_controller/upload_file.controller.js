
const { Message, Chat, Participant } = require("../../../models");
const { generalResponse } = require("../../helper/response.helper");

async function uploadFile(req, res) {
  try {
    const user_id = req.authData.user_id;
    const messageType = req.body.message_type || "doc";
    const chatId = req.body.chat_id;
    const otherUserId = req.body.user_id;

    if (!req.files || req.files.length === 0) {
      return generalResponse(res, {}, "No file uploaded", false, true, 400);
    }

    const filePath = req.files[0].path;
    const fileName = req.body.message_content || req.files[0].originalname || "file";

    let targetChatId = chatId ? Number(chatId) : null;

    // If no chat_id, find or create chat between users
    if (!targetChatId && otherUserId) {
      const participant = await Participant.findOne({
        where: { user_id: user_id },
        include: [{
          model: Chat,
          as: "Chat",
          where: { chat_type: "single" },
          include: [{
            model: Participant,
            as: "participants",
            where: { user_id: Number(otherUserId) },
          }],
        }],
      });
      if (participant) {
        targetChatId = participant.chat_id;
      } else {
        const newChat = await Chat.create({ chat_type: "single" });
        targetChatId = newChat.chat_id;
        await Participant.bulkCreate([
          { user_id: user_id, chat_id: targetChatId },
          { user_id: Number(otherUserId), chat_id: targetChatId },
        ]);
      }
    }

    if (!targetChatId) {
      return generalResponse(res, {}, "chat_id or user_id is required", false, true, 400);
    }

    const message = await Message.create({
      sender_id: user_id,
      chat_id: targetChatId,
      message_type: messageType,
      message_content: filePath,
      message_thumbnail: "",
    });

    return generalResponse(res, {
      message_id: message.message_id,
      message_content: filePath,
      chat_id: targetChatId,
      message_type: messageType,
    }, "File uploaded successfully", true, false, 200);
  } catch (error) {
    console.error("uploadFile error:", error);
    return generalResponse(res, {}, error.message || "Upload failed", false, true, 500);
  }
}

module.exports = { uploadFile };
