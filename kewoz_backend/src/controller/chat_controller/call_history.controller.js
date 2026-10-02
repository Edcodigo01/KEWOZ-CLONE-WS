const participant_service = require("../../service/repository/Participant.service");
const message_service = require("../../service/repository/Message.service");
const { Chat, Call, User } = require("../../../models");
const { generalResponse } = require("../../helper/response.helper");
const { Op } = require("sequelize");

const USER_ATTRIBUTES = ["user_id", "user_name", "full_name", "profile_pic", "banner_image"];

async function call_history(req, res) {
  try {
    const user_id = req.authData.user_id;
    const page = parseInt(req.body.page) || 1;
    const pageSize = parseInt(req.body.pageSize) || 10;

    const participants = await participant_service.getParticipantWithoutPagenation({ user_id });
    const chatIds = participants.Records.map((p) => p.chat_id);

    if (!chatIds.length) {
      return generalResponse(res, {
        Records: [],
        Pagination: {
          total_pages: Number(page),
          total_records: Number(pageSize),
          current_page: Number(page),
          records_per_page: Number(pageSize),
        },
      }, "No call history found.", true, false, 200);
    }

    const result = await message_service.getMessages(
      {
        chat_id: { [Op.in]: chatIds },
        message_type: "call",
      },
      [
        {
          model: Call,
          attributes: ["call_id", "call_type", "call_duration", "call_status"],
          include: [
            {
              model: User,
              attributes: USER_ATTRIBUTES,
              as: "caller",
            },
          ],
        },
        {
          model: Chat,
          attributes: ["chat_id", "chat_type", "group_name", "group_icon"],
        },
      ],
      { page, pageSize },
      []
    );

    // Fetch all private chat participants in parallel
    const privateRecords = result.Records.filter((r) => r.Chat.chat_type === "private");
    const participantResults = await Promise.all(
      privateRecords.map((record) =>
        participant_service.getParticipantWithoutPagenation(
          { chat_id: record.Chat.chat_id },
          [{ model: User, attributes: USER_ATTRIBUTES }]
        )
      )
    );

    const privateChatMap = new Map();
    privateRecords.forEach((record, i) => {
      privateChatMap.set(record.Chat.chat_id, participantResults[i]);
    });

    for (const record of result.Records) {
      if (record.Chat.chat_type === "private") {
        const parts = privateChatMap.get(record.Chat.chat_id);
        const other = parts?.Records.find((p) => p.user_id !== user_id);
        record.peer_user = other ? other.User : null;
      } else {
        record.peer_user = null;
      }
    }
    return generalResponse(res, result, "Call history fetched successfully!", true, 200);
  } catch (error) {
    console.error("Error in fetching call history:", error);
    return generalResponse(res, { success: false }, error.message, false, 402);
  }
}

module.exports = {
  call_history,
};
