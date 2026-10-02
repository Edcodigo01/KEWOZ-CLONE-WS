// const socket_service = require("../../service/common/socket.service");
// const participant_service = require("../../service/repository/Participant.service");
// const message_service = require("../../service/repository/Message.service");
// const { Participant } = require("../../../models");
// const updateFieldsFilter = require("../../helper/updateField.helper");
// const { getUser } = require("../../service/repository/user.service");
// const { generalResponse } = require("../../helper/response.helper");
// const { User, Message, Call, Story , Poll } = require("../../../models");

// // req: { message_id, pin_lifetime: days }
// async function pinUnpinMessage(req, res) {
//   try {
//     // Get user ID from authenticated request data
//     const user_id = req.authData.user_id;
//     let filteredData;
//     try {
//       // Filter and validate required fields from request body
//       filteredData = updateFieldsFilter(
//         req.body,
//         ["message_id", "pin_lifetime"],
//         true
//       );
//     } catch (err) {
//       // Handle validation errors
//       return generalResponse(res, {}, err.message, true, false, 402);
//     }

//     // Fetch the message to be pinned/unpinned
//     let message = await message_service.getMessage({
//       message_id: filteredData.message_id,
//     });

//     // Check message exists before accessing its properties
//     if (!message) {
//       return generalResponse(res, {}, "Invalid message.", true, false, 402);
//     }

//     // Check if user is a participant in the chat
//     const user = await Participant.findOne({
//       where: { user_id, chat_id: message.chat_id },
//     });
//     if (!user) {
//       return generalResponse(res, {}, "You're not a member of this group.", true, false, 402);
//     }

//     // Fetch all participants in the chat
//     const participants =
//       await participant_service.getParticipantWithoutPagenation({
//         chat_id: message.dataValues.chat_id,
//       });

//     // Get user details for all participants
//     const users = await Promise.all(
//       participants.Records.map((p) => getUser({ user_id: p.user_id }))
//     );
//     // Options for including related models in chat queries
//     const includeOptionsforChat = [
//       {
//         model: Message,
//         as: "ParentMessage",
//         include: [

//           {
//             model: User,
//             attributes: [
//               "profile_pic",
//               "banner_image",
//               "user_id",
//               "full_name",
//               "user_name",
//               "email",
//               "country_code",
//               "country",
//               "gender",
//             ],
//           },
//         ],
//       },
//       {
//         model: Message,
//         as: "Replies",
//         // required: false, // LEFT JOIN, keeps main row even if no matching ParentMessage
//         // where: {
//         //   message_type: { [Op.ne]: "block" }, // not equal to "blocked"
//         // },
//       },

//       {
//         model: User,
//         attributes: [
//           "profile_pic",
//           "banner_image",
//           "user_id",
//           "full_name",
//           "user_name",
//           "email",
//           "country_code",
//           "country",
//           "gender",
//           "description",
//           "profile_verification_status",
//           "login_verification_status",
//           "socket_ids",
//         ],
//       },
//       {
//         model: Story,
//         required: false, // LEFT JOIN, keeps main row even if no matching Story
//         include: [{
//           model: User,
//           as: "user",
//           attributes: [
//             "profile_pic",
//             "banner_image",
//             "user_id",
//             "full_name",
//             "user_name",
//             "email",
//             "country_code",
//             "country",
//             "gender",
//             "description",
//             "profile_verification_status",
//             "login_verification_status",
//             "socket_ids",
//           ],
//         }],
//         where: {
//           is_expired: false
//         }
//       },
//       {
//         model: User,
//         as: "ActionedUser",
//         attributes: [
//           "profile_pic",
//           "banner_image",
//           "user_id",
//           "full_name",
//           "user_name",
//           "email",
//           "country_code",
//           "country",
//           "gender",
//           "description",
//           "profile_verification_status",
//           "login_verification_status",
//           "socket_ids",
//         ],
//       },
//       {
//         model: Call,
//         as: "Calls",
//         include: [
//           {
//             model: User,
//             as: "caller",
//             attributes: [
//               "profile_pic",
//               "banner_image",
//               "user_id",
//               "full_name",
//               "user_name",
//               "email",
//               "country_code",
//               "country",
//               "gender",
//             ],
//           },
//         ],
//       },
//     ];

//     let pinMessage;
//     // If message is not pinned, pin it with provided lifetime
//     if (!message.pinned) {
//       pinMessage = await message_service.pinUnpinMessage(
//         {
//           pinned: !message.pinned,
//           pin_lifetime: filteredData.pin_lifetime,
//           pinned_till: filteredData.pinned_till,
//         },
//         filteredData.message_id,
//         includeOptionsforChat
//       );
//     } else {
//       // If message is already pinned, unpin it and reset lifetime/till date
//       pinMessage = await message_service.pinUnpinMessage(
//         { pinned: !message.pinned, pin_lifetime: null, pinned_till: null },
//         filteredData.message_id,
//         includeOptionsforChat
//       );
//     }
//     // If pin/unpin operation failed, send error response
//     if (!pinMessage) {
//       return generalResponse(res,{},"Message not pinned, Try again.",true,false,402);
//     }

//     // Collect all socket IDs from users in the chat
//     const socket_ids = users.flatMap((user) => user.socket_ids);

//     // Emit event to all participants to notify pin/unpin action
//     socket_service.emitEvent(
//       [...socket_ids, user.socket_ids],
//       "pinned_unpinned_message",
//       { Records: [pinMessage] }
//     );

//     // Send response indicating success
//     return generalResponse(res,{},`Message pinned: ${pinMessage.pinned} successfully !!`,true,true,200);
//   } catch (error) {
//     // Handle unexpected errors
//     return generalResponse(
//       res,
//       { success: false },
//       error.message,
//       false,
//       true,
//       402
//     );
//   }
// }

// module.exports = {
//   pinUnpinMessage,
// };

const socket_service = require("../../service/common/socket.service");
const participant_service = require("../../service/repository/Participant.service");
const message_service = require("../../service/repository/Message.service");
const { Participant } = require("../../../models");
const updateFieldsFilter = require("../../helper/updateField.helper");
const { getUser } = require("../../service/repository/user.service");
const { generalResponse } = require("../../helper/response.helper");
const { User, Message, Call, Story, Poll } = require("../../../models");

// req: { message_id, pin_lifetime: days }
async function pinUnpinMessage(req, res) {
  try {
    const user_id = req.authData.user_id;

    let filteredData;
    try {
      filteredData = updateFieldsFilter(
        req.body,
        ["message_id", "pin_lifetime"],
        true
      );
    } catch (err) {
      return generalResponse(res, {}, err.message, true, false, 402);
    }

    // Get message
    let message = await message_service.getMessage({
      message_id: filteredData.message_id,
    });

    if (!message) {
      return generalResponse(res, {}, "Invalid message.", true, false, 402);
    }

    // Check participant
    const user = await Participant.findOne({
      where: { user_id, chat_id: message.chat_id },
    });

    if (!user) {
      return generalResponse(
        res,
        {},
        "You're not a member of this group.",
        true,
        false,
        402
      );
    }

    // Get participants
    const participants =
      await participant_service.getParticipantWithoutPagenation({
        chat_id: message.chat_id,
      });

    const users = await Promise.all(
      participants.Records.map((p) => getUser({ user_id: p.user_id }))
    );

    // ✅ IMPORTANT: include Poll here
    const includeOptionsforChat = [
      {
        model: Message,
        as: "ParentMessage",
        include: [
          {
            model: User,
            attributes: [
              "profile_pic",
              "banner_image",
              "user_id",
              "full_name",
              "user_name",
              "email",
              "country_code",
              "country",
              "gender",
            ],
          },
        ],
      },
      {
        model: Message,
        as: "Replies",
      },
      {
        model: User,
        attributes: [
          "profile_pic",
          "banner_image",
          "user_id",
          "full_name",
          "user_name",
          "email",
          "country_code",
          "country",
          "gender",
          "description",
          "profile_verification_status",
          "login_verification_status",
          "socket_ids",
        ],
      },
      {
        model: Story,
        required: false,
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              "profile_pic",
              "banner_image",
              "user_id",
              "full_name",
              "user_name",
              "email",
              "country_code",
              "country",
              "gender",
              "description",
              "profile_verification_status",
              "login_verification_status",
              "socket_ids",
            ],
          },
        ],
        where: { is_expired: false },
      },
      {
        model: User,
        as: "ActionedUser",
        attributes: [
          "profile_pic",
          "banner_image",
          "user_id",
          "full_name",
          "user_name",
          "email",
          "country_code",
          "country",
          "gender",
          "description",
          "profile_verification_status",
          "login_verification_status",
          "socket_ids",
        ],
      },
      {
        model: Call,
        as: "Calls",
        include: [
          {
            model: User,
            as: "caller",
            attributes: [
              "profile_pic",
              "banner_image",
              "user_id",
              "full_name",
              "user_name",
              "email",
              "country_code",
              "country",
              "gender",
            ],
          },
        ],
      },
      // ✅ ADD THIS
      {
        model: Poll,
        include: [
          {
            model: User,
            attributes: [
              "user_id",
              "full_name",
              "user_name",
              "profile_pic",
            ],
          },
        ],
      },
    ];

    let pinMessage;

    if (!message.pinned) {
      pinMessage = await message_service.pinUnpinMessage(
        {
          pinned: true,
          pin_lifetime: filteredData.pin_lifetime,
          pinned_till: filteredData.pinned_till,
        },
        filteredData.message_id,
        includeOptionsforChat
      );
    } else {
      pinMessage = await message_service.pinUnpinMessage(
        { pinned: false, pin_lifetime: null, pinned_till: null },
        filteredData.message_id,
        includeOptionsforChat
      );
    }

    if (!pinMessage) {
      return generalResponse(
        res,
        {},
        "Message not pinned, Try again.",
        true,
        false,
        402
      );
    }

    // ✅ FORMAT POLL (IMPORTANT)
    let finalMessage = pinMessage;

    if (pinMessage.message_type === "poll" && pinMessage.Poll) {
      const allVoterIds = pinMessage.Poll.poll_options.flatMap(
        (opt) => opt.votes || []
      );

      const uniqueVoterIds = [...new Set(allVoterIds)];

      const voters = await Promise.all(
        uniqueVoterIds.map((id) => getUser({ user_id: id }))
      );

      const voterMap = voters.reduce((map, user) => {
        map[user.user_id] = {
          user_id: user.user_id,
          full_name: user.full_name,
          user_name: user.user_name,
          profile_pic: user.profile_pic,
        };
        return map;
      }, {});

      finalMessage = {
        ...pinMessage.dataValues,
        poll_data: {
          poll_id: pinMessage.Poll.poll_id,
          question: pinMessage.message_content,
          options: pinMessage.Poll.poll_options.map((opt) => ({
            option: opt.option,
            votes: (opt.votes || [])
              .map((id) => voterMap[id])
              .filter(Boolean),
          })),
          allow_multiple_votes:
            pinMessage.Poll.allow_multiple_votes || false,
          created_by: pinMessage.Poll.User
            ? {
                user_id: pinMessage.Poll.User.user_id,
                full_name: pinMessage.Poll.User.full_name,
                user_name: pinMessage.Poll.User.user_name,
                profile_pic: pinMessage.Poll.User.profile_pic,
              }
            : null,
          total_votes: pinMessage.Poll.poll_options.reduce(
            (sum, opt) => sum + (opt.votes ? opt.votes.length : 0),
            0
          ),
          user_vote:
            pinMessage.Poll.poll_options.find(
              (opt) =>
                opt.votes && opt.votes.includes(user_id)
            )?.option || null,
        },
      };

      delete finalMessage.Poll;
    }

    // sockets
    const socket_ids = users.flatMap((u) => u.socket_ids);

    socket_service.emitEvent(
      [...socket_ids, user.socket_ids],
      "pinned_unpinned_message",
      { Records: [finalMessage] }
    );

    return generalResponse(
      res,
      {},
      `Message pinned: ${finalMessage.pinned} successfully !!`,
      true,
      true,
      200
    );
  } catch (error) {
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
  pinUnpinMessage,
};
