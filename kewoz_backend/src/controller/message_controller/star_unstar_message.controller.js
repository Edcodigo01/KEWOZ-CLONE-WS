// const socket_service = require("../../service/common/socket.service");
// const message_service = require("../../service/repository/Message.service");
// const updateFieldsFilter = require("../../helper/updateField.helper");
// const { generalResponse } = require("../../helper/response.helper");

// async function starUnstarMessage(req, res) {
//   try {
//     let filteredData;
//     try {
//       filteredData = updateFieldsFilter(req.body, ["message_id"], true);
//     } catch (err) {
//       return generalResponse(res, {}, err.message, true, 402);
//     }

//     let message = await message_service.getMessage({ message_id: filteredData.message_id });
//     if (!message) {
//       return generalResponse(res, {}, "Invalid message.", true, 402);
//     }

//     const user_id = req.authData.user_id;
//     const alreadyStarred = message.dataValues.starred_for.includes(user_id.toString());

//     message = await message_service.starUnstarMessage(
//       alreadyStarred
//         ? message.dataValues.starred_for.filter((id) => id != user_id.toString())
//         : [...message.dataValues.starred_for, user_id],
//       filteredData.message_id
//     );

//     if (!message) {
//       return generalResponse(res, {}, "Message not starred, Try again.", true, 402);
//     }

//     const starred = message[1][0].starred_for.includes(user_id.toString());

//     // Use req.user (already fetched by authMiddleware) — no extra DB call
//     socket_service.emitEvent(
//       req.user.socket_ids,
//       "star_unstar_message",
//       { Records: [{ ...message[1][0].dataValues, starred }] }
//     );

//     return generalResponse(res, {}, `Message starred:${starred} successfully!!`, true, 200);
//   } catch (error) {
//     return generalResponse(res, { success: false }, error.message, false, 500);
//   }
// }

// module.exports = {
//   starUnstarMessage,
// };

const socket_service = require("../../service/common/socket.service");
const message_service = require("../../service/repository/Message.service");
const { getUser } = require("../../service/repository/user.service");
const updateFieldsFilter = require("../../helper/updateField.helper");
const { generalResponse } = require("../../helper/response.helper");

async function starUnstarMessage(req, res) {
  try {
    let filteredData;
    try {
      filteredData = updateFieldsFilter(req.body, ["message_id"], true);
    } catch (err) {
      return generalResponse(res, {}, err.message, true, 402);
    }

    let message = await message_service.getMessage({ message_id: filteredData.message_id });
    if (!message) {
      return generalResponse(res, {}, "Invalid message.", true, 402);
    }

    const user_id = req.authData.user_id;
    const alreadyStarred = message.dataValues.starred_for.includes(user_id.toString());

    message = await message_service.starUnstarMessage(
      alreadyStarred
        ? message.dataValues.starred_for.filter((id) => id != user_id.toString())
        : [...message.dataValues.starred_for, user_id],
      filteredData.message_id
    );

    if (!message) {
      return generalResponse(res, {}, "Message not starred, Try again.", true, 402);
    }

    const starred = message[1][0].starred_for.includes(user_id.toString());
    let emitMessage = { ...message[1][0].dataValues, starred };

    // If this is a poll, attach poll_data like in message_list
    if (emitMessage.message_type === "poll" && emitMessage.Poll) {
      const pollOptions = emitMessage.Poll.poll_options || [];
      const pollVoterIds = pollOptions.flatMap(opt => opt.votes || []);
      const uniqueVoters = [...new Set(pollVoterIds)];
      const voters = await Promise.all(uniqueVoters.map(id => getUser({ user_id: id })));
      const voterMap = voters.reduce((map, u) => {
        map[u.user_id] = { user_id: u.user_id, full_name: u.full_name, user_name: u.user_name, profile_pic: u.profile_pic };
        return map;
      }, {});

      emitMessage.poll_data = {
        poll_id: emitMessage.Poll.poll_id,
        question: emitMessage.message_content,
        options: pollOptions.map(opt => ({
          option: opt.option,
          votes: (opt.votes || []).map(id => voterMap[id]).filter(Boolean),
        })),
        allow_multiple_votes: emitMessage.Poll.allow_multiple_votes || false,
        created_by: emitMessage.Poll.User
          ? {
              user_id: emitMessage.Poll.User.user_id,
              full_name: emitMessage.Poll.User.full_name,
              user_name: emitMessage.Poll.User.user_name,
              profile_pic: emitMessage.Poll.User.profile_pic,
            }
          : null,
        total_votes: pollOptions.reduce((sum, opt) => sum + (opt.votes ? opt.votes.length : 0), 0),
        user_vote: pollOptions.find(opt => opt.votes && opt.votes.includes(user_id))?.option || null,
      };

      delete emitMessage.Poll; // remove original Poll object
    }

    // Emit the updated message with poll data if applicable
    socket_service.emitEvent(req.user.socket_ids, "star_unstar_message", { Records: [emitMessage] });

    return generalResponse(res, {}, `Message starred:${starred} successfully!!`, true, 200);
  } catch (error) {
    return generalResponse(res, { success: false }, error.message, false, 500);
  }
}

module.exports = {
  starUnstarMessage,
};