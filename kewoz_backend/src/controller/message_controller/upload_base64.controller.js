
const { Message } = require("../../../models");
const { generalResponse } = require("../../helper/response.helper");
const fs = require("fs");
const path = require("path");

async function uploadBase64(req, res) {
  try {
    const user_id = req.authData.user_id;
    const { file_base64, file_name, message_type, chat_id } = req.body;

    if (!file_base64) {
      return generalResponse(res, {}, "No file data provided", false, true, 400);
    }

    const uploadDir = "./uploads/others";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const safeName = (file_name || "file").replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = path.join(uploadDir, Date.now() + "-" + safeName);
    
    const buffer = Buffer.from(file_base64, "base64");
    fs.writeFileSync(filePath, buffer);

    const message = await Message.create({
      sender_id: user_id,
      chat_id: chat_id || null,
      message_type: message_type || "doc",
      message_content: filePath,
      message_thumbnail: "",
    });

    return generalResponse(res, {
      message_id: message.message_id,
      message_content: filePath,
      chat_id: message.chat_id,
    }, "File uploaded", true, false, 200);
  } catch (error) {
    console.error("uploadBase64 error:", error);
    return generalResponse(res, {}, error.message, false, true, 500);
  }
}

module.exports = { uploadBase64 };
