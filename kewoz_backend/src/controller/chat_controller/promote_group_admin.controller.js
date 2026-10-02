const participant_service = require("../../service/repository/Participant.service");
const chat_service = require("../../service/repository/Chat.service");
const { Participant } = require("../../../models");
const updateFieldsFilter = require("../../helper/updateField.helper");
const { generalResponse } = require("../../helper/response.helper");
const { sendMessage } = require("../../controller/message_controller/send_message.controller");

const MOCK_RES = {
  status: function () { return this; },
  send: function (data) { return data; },
};

async function promoteAsGroupAdmin(req, res) {
  try {
    const user_id = req.authData.user_id;

    let filteredData;
    try {
      filteredData = updateFieldsFilter(req.body, ["admin_user_id", "chat_id"], true);
    } catch (err) {
      return generalResponse(res, {}, err.message, true, false, 402);
    }

    const isGroup = await chat_service.isGroup(filteredData.chat_id);
    if (!isGroup) {
      return generalResponse(res, {}, "Invalid group.", true, false, 402);
    }

    const user = await Participant.findOne({
      where: { user_id, chat_id: filteredData.chat_id },
    });

    if (!user?.is_admin) {
      return generalResponse(
        res,
        {},
        "You're not an admin, Only admins can create new admins.",
        true,
        false,
        402
      );
    }

    const participant = await Participant.findOne({
      where: { user_id: filteredData.admin_user_id, chat_id: filteredData.chat_id },
    });

    if (!participant) {
      return generalResponse(res, {}, "User not found", true, false, 402);
    }

    await participant_service.updateParticipant(
      { is_admin: !participant.is_admin },
      { chat_id: filteredData.chat_id, user_id: filteredData.admin_user_id }
    );

    await sendMessage(
      {
        body: {
          chat_id: isGroup.chat_id,
          message_content: participant.is_admin ? "Removed As Admin" : "Promoted As Admin",
          message_type: participant.is_admin ? "removed-as-admin" : "promoted-as-admin",
          user_id: user.user_id,
          peer_user: filteredData.admin_user_id,
        },
        authData: req.authData,
        files: req.files,
      },
      MOCK_RES
    );

    return generalResponse(res, {}, "Group admin updated Successfully !!", true, true, 200);
  } catch (error) {
    return generalResponse(res, { success: false }, "error in creating group admin.", false, true, 402);
  }
}

module.exports = {
  promoteAsGroupAdmin,
};
