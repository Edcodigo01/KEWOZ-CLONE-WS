// const socket_service = require("../../service/common/socket.service");
// const participant_service = require("../../service/repository/Participant.service");
// const poll_service = require("../../service/repository/Poll.service");
// const message_service = require("../../service/repository/Message.service");
// const updateFieldsFilter = require("../../helper/updateField.helper");
// const { getUser } = require("../../service/repository/user.service");
// const { generalResponse } = require("../../helper/response.helper");

// async function votePoll(req, res) {
//   try {
//     let filteredData;
//     try {
//       filteredData = updateFieldsFilter(req.body, ["poll_id", "option"], true);
//     } catch (err) {
//       return generalResponse(res, {}, err.message, true, 402);
//     }

//     let poll = await poll_service.votePoll(
//       filteredData.poll_id,
//       filteredData.option,
//       req.authData.user_id
//     );

//     if (!poll) {
//       return generalResponse(res, {}, "Invalid poll.", true, 402);
//     }

//     poll = await poll_service.getPoll(filteredData.poll_id);

//     const participants = await participant_service.getParticipantWithoutPagenation({ chat_id: poll.chat_id });
//     const users = await Promise.all(
//       participants.Records.map((p) => getUser({ user_id: p.user_id }))
//     );

//     const message = await message_service.getMessages({ message_id: poll.message_id }, [], {page:1, pageSize:1});
//     const question = message.Records[0].message_content;

//     const allVoterIds = poll.poll_options.flatMap(opt => opt.votes || []);
//     const uniqueVoterIds = [...new Set(allVoterIds)];
//     const voters = await Promise.all(uniqueVoterIds.map(id => getUser({ user_id: id })));
//     const voterMap = voters.reduce((map, user) => {
//       map[user.user_id] = {
//         user_id: user.user_id,
//         full_name: user.full_name,
//         user_name: user.user_name,
//         profile_pic: user.profile_pic,
//       };
//       return map;
//     }, {});

//     for (const user of users) {
//       const poll_data = {
//         poll_id: poll.poll_id,
//         question,
//         options: poll.poll_options.map(opt => ({
//           option: opt.option,
//           votes: (opt.votes || []).map(id => voterMap[id]).filter(Boolean)
//         })),
//         allow_multiple_votes: poll.allow_multiple_votes,
//         created_by: poll.User ? {
//           user_id: poll.User.user_id,
//           full_name: poll.User.full_name,
//           user_name: poll.User.user_name,
//           profile_pic: poll.User.profile_pic,
//         } : null,
//         total_votes: poll.poll_options.reduce((sum, opt) => sum + (opt.votes ? opt.votes.length : 0), 0),
//         user_vote: poll.poll_options.find(opt => opt.votes && opt.votes.includes(user.user_id))?.option || null,
//       };
//       socket_service.emitEvent(user.socket_ids, "poll_voted", poll_data);
//     }

//     return generalResponse(res, {}, "Poll voted successfully!!", true, 200);
//   } catch (error) {
//     console.error("Error in voting for the poll:", error);
//     return generalResponse(res, { success: false }, error.message, false, 402);
//   }
// }

// module.exports = {
//   votePoll,
// };

const socket_service = require("../../service/common/socket.service");
const participant_service = require("../../service/repository/Participant.service");
const poll_service = require("../../service/repository/Poll.service");
const message_service = require("../../service/repository/Message.service");
const updateFieldsFilter = require("../../helper/updateField.helper");
const { getUser } = require("../../service/repository/user.service");
const { generalResponse } = require("../../helper/response.helper");

async function votePoll(req, res) {
  try {
    let filteredData;

    try {
      filteredData = updateFieldsFilter(
        req.body,
        ["poll_id", "option"],
        true
      );
    } catch (err) {
      return generalResponse(res, {}, err.message, true, 402);
    }

    // ✅ Vote
    let poll = await poll_service.votePoll(
      filteredData.poll_id,
      filteredData.option,
      req.authData.user_id
    );

    if (!poll) {
      return generalResponse(res, {}, "Invalid poll.", true, 402);
    }

    // ✅ Get updated poll
    poll = await poll_service.getPoll(filteredData.poll_id);

    const participants =
      await participant_service.getParticipantWithoutPagenation({
        chat_id: poll.chat_id,
      });

    const users = await Promise.all(
      participants.Records.map((p) =>
        getUser({ user_id: p.user_id })
      )
    );

    const message = await message_service.getMessages(
      { message_id: poll.message_id },
      [],
      { page: 1, pageSize: 1 }
    );

    const question = message.Records[0]?.message_content || "";

    // ✅ Collect all voters
    const allVoterIds = poll.poll_options.flatMap(
      (opt) => opt.votes || []
    );

    const uniqueVoterIds = [...new Set(allVoterIds)];

    const voters = await Promise.all(
      uniqueVoterIds.map((id) =>
        getUser({ user_id: id })
      )
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

    // ✅ Emit socket
    for (const user of users) {
      const poll_data = {
        poll_id: poll.poll_id,
        question,
        options: poll.poll_options.map((opt) => ({
          option: opt.option,
          votes: (opt.votes || [])
            .map((id) => voterMap[id])
            .filter(Boolean),
        })),
        allow_multiple_votes: poll.allow_multiple_votes,
        created_by: poll.User
          ? {
              user_id: poll.User.user_id,
              full_name: poll.User.full_name,
              user_name: poll.User.user_name,
              profile_pic: poll.User.profile_pic,
            }
          : null,
        total_votes: poll.poll_options.reduce(
          (sum, opt) => sum + (opt.votes?.length || 0),
          0
        ),
        user_vote:
          poll.poll_options
            .filter((opt) =>
              opt.votes?.includes(user.user_id)
            )
            .map((opt) => opt.option), // ✅ supports multi वोट
      };

      socket_service.emitEvent(
        user.socket_ids,
        "poll_voted",
        poll_data
      );
    }

    return generalResponse(
      res,
      {},
      "Poll voted successfully!!",
      true,
      200
    );
  } catch (error) {
    console.error("Error in voting for the poll:", error);
    return generalResponse(
      res,
      {},
      error.message,
      false,
      402
    );
  }
}

module.exports = {
  votePoll,
};