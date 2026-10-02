const participant_service = require("../../service/repository/Participant.service");
const chat_service = require("../../service/repository/Chat.service");
const { Participant } = require("../../../models");
const updateFieldsFilter = require("../../helper/updateField.helper");
const { generalResponse } = require("../../helper/response.helper");

async function deleteChat(req, res) {
  try {
    const user_id = req.authData.user_id; // ✅ Extract logged-in user ID from auth token
    let filteredData;

    // ✅ Validate required fields: chat_id & last_message_id
    try {
      filteredData = await updateFieldsFilter(
        req.body,
        ["chat_id", "last_message_id"],
        true
      );
    } catch (err) {
      // If validation fails → return error response
      return generalResponse(res, {}, err.message, true, false, 402);
    }

    // ✅ Check if chat exists in DB
    const isChat = await chat_service.getChat({
      chat_id: filteredData.chat_id,
    });
    if (!isChat) {
      return generalResponse(res, {}, "Invalid group.", true, false, 402);
    }

    // ✅ Verify that requesting user is a participant in the chat
    const user = await Participant.findOne({
      where: {
        user_id: user_id,
        chat_id: filteredData.chat_id,
      },
    });
    if (!user) {
      return generalResponse(
        res,
        {},
        "You are not a member of this group.",
        true,
        false,
        402
      );
    }

    // ✅ Update participant record with `last_message_id`
    // This acts as a "soft delete" → hides chat for this user only
    await participant_service.updateParticipant(
      { last_message_id: filteredData.last_message_id },
      { user_id: user_id, chat_id: filteredData.chat_id }
    );

    // ✅ Return success response
    return generalResponse(
      res,
      {},
      "Group deleted Successfully !!",
      true,
      true,
      200
    );
  } catch (error) {
    // ❌ Catch any unexpected errors
    return generalResponse(
      res,
      { success: false },
      error.message,
      false,
      true,
      402
    );
  }
}

module.exports = {
  deleteChat,
};
