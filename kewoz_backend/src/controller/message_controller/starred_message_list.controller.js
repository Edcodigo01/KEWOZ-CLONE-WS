const message_service = require("../../service/repository/Message.service");
const { Chat, Sequelize, User, Poll } = require("../../../models");
const { generalResponse } = require("../../helper/response.helper");
const { Op } = require("sequelize");
const { getParticipant } = require("../../service/repository/Participant.service");
const { getUser } = require("../../service/repository/user.service");

async function starredMessageList(req, res) {
  try {
    const isUser = req.user;
    const chat_id = req.body.chat_id;
    let starred_messages;

    const baseWhere = {
      [Op.and]: [
        Sequelize.literal(
          `NOT ("Message"."deleted_for" @> ARRAY['${isUser.user_id}']::decimal[])`
        ),
        Sequelize.literal(
          `"Message"."starred_for" @> ARRAY['${isUser.user_id}']::decimal[]`
        ),
      ],
    };

    const includeOptions = [
      {
        model: User,
        attributes: [
          "user_name", "email", "profile_pic", "banner_image",
          "user_id", "full_name", "country_code", "country",
          "gender", "description", "profile_verification_status",
          "login_verification_status", "socket_ids","user_type"
        ],
      },
      {
        model: Chat,
        attributes: ["chat_id", "chat_type", "group_name", "group_icon"],
        ...(chat_id && { where: { chat_id } }),
      },
      {
        model: Poll,
        include: [
          {
            model: User,
            attributes: ["user_id", "full_name", "user_name", "profile_pic"],
          },
        ],
      },
    ];

    starred_messages = await message_service.getMessages(baseWhere, includeOptions);

    // Process peer users and polls
    await Promise.all(
      starred_messages.Records.map(async (element) => {
        // Peer user logic
        if (element.Chat.chat_type === "private") {
          const peer_user = await getParticipant(
            { chat_id: element.Chat.chat_id, user_id: { [Op.ne]: isUser.user_id } },
            [
              {
                model: User,
                attributes: [
                  "profile_pic", "banner_image", "user_id", "full_name",
                  "user_name", "email", "country_code", "country", "gender",
                  "description", "profile_verification_status",
                  "login_verification_status", "socket_ids","user_type"
                ],
              },
            ]
          );
          element.peer_user = peer_user.Records[0]?.User || null;
        } else {
          element.peer_user = isUser;
        }

        // Poll processing
        if (element.message_type === "poll" && element.Poll) {
          const poll = element.Poll;
          const allVotes = poll.poll_options.flatMap(opt => opt.votes || []);
          const uniqueVoterIds = [...new Set(allVotes)];
          const pollVoters = await Promise.all(uniqueVoterIds.map(id => getUser({ user_id: id })));
          const pollVoterMap = pollVoters.reduce((map, user) => {
            map[user.user_id] = {
              user_id: user.user_id,
              full_name: user.full_name,
              user_name: user.user_name,
              profile_pic: user.profile_pic,
            };
            return map;
          }, {});

          element.poll_data = {
            poll_id: poll.poll_id,
            question: element.message_content,
            options: poll.poll_options.map(opt => ({
              option: opt.option,
              votes: (opt.votes || []).map(id => pollVoterMap[id]).filter(Boolean)
            })),
            allow_multiple_votes: poll.allow_multiple_votes,
            created_by: poll.User ? {
              user_id: poll.User.user_id,
              full_name: poll.User.full_name,
              user_name: poll.User.user_name,
              profile_pic: poll.User.profile_pic,
            } : null,
            total_votes: poll.poll_options.reduce((sum, opt) => sum + (opt.votes ? opt.votes.length : 0), 0),
            user_vote: poll.poll_options.find(opt => opt.votes && opt.votes.includes(isUser.user_id))?.option || null,
          };

          delete element.Poll; // Remove raw Poll object
        }
      })
    );

    return generalResponse(res, starred_messages ?? [], "Starred messages fetched successfully!!", true, 200);
  } catch (error) {
    console.error("Error in starredMessageList:", error);
    return generalResponse(res, {}, error.message, false, 402);
  }
}

module.exports = {
  starredMessageList,
};