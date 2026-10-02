const participant_service = require("../../service/repository/Participant.service");
const chat_service = require("../../service/repository/Chat.service");
const updateFieldsFilter = require("../../helper/updateField.helper");
const { generalResponse } = require("../../helper/response.helper");
const config_service = require("../../service/common/config.service");
const { sendMessage } = require("../message_controller/send_message.controller");

const MOCK_RES = {
  status: function () { return this; },
  send: function (data) { return data; },
};

async function createGroup(req, res) {
  try {
    const user_id = req.authData.user_id;
    let filteredData;

    try {
      filteredData = await updateFieldsFilter(req.body, ["participants", "group_name"], true);
      if (req.body.group_description) {
        filteredData.group_description = req.body.group_description;
      }
    } catch (err) {
      return generalResponse(res, {}, err.message, true, false, 402);
    }

    const config = await config_service.getConfig({ config_id: 1 });
    if (config.maximum_members_in_group < filteredData.participants?.length) {
      return generalResponse(
        res,
        {},
        `Maximum of ${config.maximum_members_in_group} members are allowed in a group.`,
        false,
        true,
        400
      );
    }

    const group = await chat_service.createChat({
      chat_type: "group",
      group_icon: req.group_icon?.[0]?.path || "",
      group_name: filteredData.group_name,
      group_description: filteredData.group_description,
    });

    if (!group || !filteredData.participants?.length) {
      return generalResponse(res, {}, "error in creating group.", true, false, 402);
    }

    // Add creator as admin participant
    await participant_service.createParticipant({
      user_id,
      is_creator: true,
      chat_id: group.chat_id,
      is_admin: true,
    });

    // Add all other participants in parallel
    const participantIds = Array.isArray(filteredData.participants)
      ? filteredData.participants
      : [filteredData.participants];

    await Promise.all(
      participantIds.map((participant) =>
        participant_service.createParticipant({ user_id: participant, chat_id: group.chat_id })
      )
    );

    await sendMessage(
      {
        body: {
          chat_id: group.chat_id,
          message_content: "This group was created.",
          message_type: "group-created",
        },
        authData: req.authData,
      },
      MOCK_RES
    );

    return generalResponse(res, group, "Group created Successfully !!", true, true, 200);
  } catch (error) {
    console.error("Error in creating group:", error);
    return generalResponse(res, { success: false }, error.message, false, true, 402);
  }
}

module.exports = {
  createGroup,
};
