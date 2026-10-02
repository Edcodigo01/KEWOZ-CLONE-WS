const participant_service = require("../../service/repository/Participant.service");
const message_service = require("../../service/repository/Message.service");
const message_seen_service = require("../../service/repository/Message_seen.service");
const { getUser } = require("../../service/repository/user.service");
const { User, Message, Call, Story, Poll } = require("../../../models");
const { Op, Sequelize } = require("sequelize"); // Ensure you're importing Op

// req: { chat_id: string, user_id: string, pinned: boolean, page, pageSize, message_type[media, document, link] }
async function message_list(socket, data, emitEvent) {
  try {
    // Fetch user details using user_id from socket authentication data
    const isUser = await getUser({ user_id: socket.authData.user_id });

    // Check if user exists
    if (!isUser) {
      return emitEvent([socket.id], "message_list", { Records: [], pagination: null, message: "User not found." });
    }

    // If chat_id is not provided, try to get chat data using user_id
    if (!data.chat_id) {
      if (!data.user_id)
        return emitEvent([socket.id], "message_list", "Chat id or user id is required.");
      else {
        // Check if a chat exists between the users
        const isChat = await participant_service.alreadyParticipantIndividual(
          data.user_id,
          isUser.user_id
        );
        if (!isChat) {
          return emitEvent([socket.id], "message_list", { Records: [], pagenation: null });

        }
        data.chat_id = isChat
      }
    }

    // Options for including user details in queries
    const includeOptions = [
      {
        model: User,
        as: "User",
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
    ];

    // Options for including related models in chat queries
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
        required: false, // LEFT JOIN, keeps main row even if no matching Story
        include: [{
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
        }],
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

    // Single participant check instead of fetching all user's participants
    const isParticipant = await participant_service.isParticipant(socket.authData.user_id, data.chat_id);

    let emmitdata = []; // Initialize an empty array for response data
    const foreignKeysConfig = [];

    if (isParticipant) {
      // Get all participants for the chat
      let [aa, chats] = await Promise.all([
        participant_service.getParticipantWithoutPagenation(
          { chat_id: data.chat_id },
          includeOptions
        ),
        (async () => {
          if (data?.message_type == 'media') {
            return message_service.getMessages(
              {
                chat_id: data.chat_id,
                message_type: {
                  [Op.in]: ['image', 'video', 'gif'],
                },
                [Op.and]: [
                  Sequelize.literal(`NOT ("Message"."deleted_for" @> ARRAY['${isUser.user_id}']::decimal[])`)
                ]
              },
              includeOptionsforChat,
              { page: data.page || 1, pageSize: data.pageSize || 10 },
              foreignKeysConfig
            );
          } else if (data?.message_type) {
            return message_service.getMessages(
              {
                chat_id: data.chat_id,
                message_type: data.message_type,
                [Op.and]: [
                  Sequelize.literal(`NOT ("Message"."deleted_for" @> ARRAY['${isUser.user_id}']::decimal[])`)
                ]
              },
              includeOptionsforChat,
              { page: data.page || 1, pageSize: data.pageSize || 10 },
              foreignKeysConfig
            );
          } else {
            return message_service.getMessages(
              {
                chat_id: data.chat_id,
                message_type: { [Op.ne]: "block" },
                [Op.and]: [
                  Sequelize.literal(`NOT ("Message"."deleted_for" @> ARRAY['${isUser.user_id}']::decimal[])`)
                ],
              },
              includeOptionsforChat,
              { page: data.page || 1, pageSize: data.pageSize || 10 },
              foreignKeysConfig
            );
          }
        })(),
      ]);

      // Collect poll voters
      const allPollVoterIds = chats.Records.filter(msg => msg.message_type === "poll" && msg.Poll).flatMap(msg => msg.Poll.poll_options.flatMap(opt => opt.votes || []));
      const uniquePollVoterIds = [...new Set(allPollVoterIds)];
      const pollVoters = await Promise.all(uniquePollVoterIds.map(id => getUser({ user_id: id })));
      const pollVoterMap = pollVoters.reduce((map, user) => {
        map[user.user_id] = {
          user_id: user.user_id,
          full_name: user.full_name,
          user_name: user.user_name,
          profile_pic: user.profile_pic,
        };
        return map;
      }, {});

      // Add 'starred' boolean to each message based on starred_for array
       if (chats && chats.Records) {
        chats.Records = chats.Records.map(msg => {
          const mappedMsg = {
            ...msg,
            starred: Array.isArray(msg.starred_for) && msg.starred_for.includes((isUser.user_id).toString()),
            voice_duration: msg.voice_duration || null,
            views: Array.isArray(msg.Message_seens)
              ? msg.Message_seens.map(s => String(s.user_id))
              : [],
            Story: msg.Story
              ? { ...msg.Story, views: Array.isArray(msg.Story.views) ? msg.Story.views.map(v => String(v.user_id)) : [] }
              : null,
          };

          // Add poll_data if message is a poll
          if (msg.message_type === "poll" && msg.Poll) {
            mappedMsg.poll_data = {
              poll_id: msg.Poll.poll_id,
              question: msg.message_content,
              options: msg.Poll.poll_options.map(opt => ({
                option: opt.option,
                votes: (opt.votes || []).map(id => pollVoterMap[id]).filter(Boolean)
              })),
              allow_multiple_votes: msg.Poll.allow_multiple_votes || false,
              created_by: msg.Poll.User ? {
                user_id: msg.Poll.User.user_id,
                full_name: msg.Poll.User.full_name,
                user_name: msg.Poll.User.user_name,
                profile_pic: msg.Poll.User.profile_pic,
              } : null,
              total_votes: msg.Poll.poll_options 
                ? msg.Poll.poll_options.reduce((sum, opt) => sum + (opt.votes ? opt.votes.length : 0), 0)
                : 0,
              user_vote: msg.Poll.poll_options
                ? msg.Poll.poll_options.find(opt => opt.votes && opt.votes.includes(isUser.user_id))?.option || null
                : null,
            };
            // Remove Poll object to avoid duplication
            delete mappedMsg.Poll;
          }

          return mappedMsg;
        });
      }

      if (data.pinned) {
        let pinned_messages = await message_service.getMessages(
          {
            chat_id: data.chat_id,
            [Op.and]: [
              Sequelize.literal(`NOT ("Message"."deleted_for" @> ARRAY['${isUser.user_id}']::decimal[])`)
            ],
            pinned: true
          },
          includeOptionsforChat
        );
        if (pinned_messages && pinned_messages.Records) {
          const allPinnedPollVoterIds = pinned_messages.Records.filter(msg => msg.message_type === "poll" && msg.Poll).flatMap(msg => msg.Poll.poll_options.flatMap(opt => opt.votes || []));
          const uniquePinnedPollVoterIds = [...new Set(allPinnedPollVoterIds)];
          const pinnedPollVoters = await Promise.all(uniquePinnedPollVoterIds.map(id => getUser({ user_id: id })));
          const pinnedPollVoterMap = pinnedPollVoters.reduce((map, user) => {
            map[user.user_id] = {
              user_id: user.user_id,
              full_name: user.full_name,
              user_name: user.user_name,
              profile_pic: user.profile_pic,
            };
            return map;
          }, {});
          pinned_messages.Records = pinned_messages.Records.map(msg => {
            const mappedMsg = {
              ...msg,
              starred: Array.isArray(msg.starred_for) && msg.starred_for.includes((isUser.user_id).toString()),
              voice_duration: msg.voice_duration || null,
            };

            // Add poll_data if message is a poll
            if (msg.message_type === "poll" && msg.Poll) {
              mappedMsg.poll_data = {
                poll_id: msg.Poll.poll_id,
                question: msg.message_content,
                options: msg.Poll.poll_options.map(opt => ({
                  option: opt.option,
                  votes: (opt.votes || []).map(id => pinnedPollVoterMap[id]).filter(Boolean)
                })),
                allow_multiple_votes: msg.Poll.allow_multiple_votes || false,
                created_by: msg.Poll.User ? {
                  user_id: msg.Poll.User.user_id,
                  full_name: msg.Poll.User.full_name,
                  user_name: msg.Poll.User.user_name,
                  profile_pic: msg.Poll.User.profile_pic,
                } : null,
                total_votes: msg.Poll.poll_options 
                  ? msg.Poll.poll_options.reduce((sum, opt) => sum + (opt.votes ? opt.votes.length : 0), 0)
                  : 0,
                user_vote: msg.Poll.poll_options
                  ? msg.Poll.poll_options.find(opt => opt.votes && opt.votes.includes(isUser.user_id))?.option || null
                  : null,
              };
              // Remove Poll object to avoid duplication
              delete mappedMsg.Poll;
            }

            return mappedMsg;
          });
        }
        emmitdata.push(pinned_messages);
      }
      else {
        emmitdata.push({
          Records: [], Pagination: {
            total_pages: 0,
            total_records: 0,
            current_page: 0,
            records_per_page: 0
          }
        });
      }

      // If there are messages, update seen status and emit results
      if (chats.Records?.length > 0) {

        // Update all message seen statuses in parallel
        await Promise.all(
          chats.Records.map(element =>
            message_seen_service.updateMessageSeen(
              { message_id: element.message_id, user_id: isUser.user_id },
              { message_seen_status: "seen" }
            ).catch(err => console.error('Error updating message seen:', err))
          )
        );

        // Check seen counts and notify senders in parallel
        await Promise.all(
          chats.Records.map(async (element) => {
            try {
              const seen_user_count = await message_seen_service.getMessageSeenCount({
                andConditions: {
                  chat_id: element.chat_id,
                  message_id: element.message_id,
                  message_seen_status: 'seen'
                }
              });

              if (aa.Records.length == seen_user_count.count && element.message_seen_status != "seen") {
                const [message_status_content, sender] = await Promise.all([
                  message_service.updateMessage({ message_id: element.message_id }, { message_seen_status: "seen" }),
                  getUser({ user_id: element.sender_id }),
                ]);
                emitEvent(sender.socket_ids, "real_time_message_seen", message_status_content[1][0]);
              }
            } catch (error) {
              console.error('Error updating message seen:', error);
            }
          })
        );

        // Add chat messages to response data
        emmitdata.push(chats);
        // Emit event with pinned and message list based on message_type
        if (data.message_type) {
          emitEvent([socket.id], "message_list_with_specific_type", { pinned_messages: emmitdata[0], message_list: emmitdata[1] });
        }
        else {
          emitEvent([socket.id], "message_list", { pinned_messages: emmitdata[0], message_list: emmitdata[1] });
        }
      }
      else {
        if (data.message_type) {
          emitEvent([socket.id], "message_list_with_specific_type", {
            pinned_messages: {
              Records: [],
              pagination: { total_pages: 0, total_records: 0, current_page: 0, records_per_page: 0 }
            },
            message_list: {
              Records: [],
              pagination: { total_pages: 0, total_records: 0, current_page: 0, records_per_page: 0 }
            },
          });
        }
        else {
          emitEvent([socket.id], "message_list", {
            pinned_messages: {
              Records: [],
              pagination: { total_pages: 0, total_records: 0, current_page: 0, records_per_page: 0 }
            },
            message_list: {
              Records: [],
              pagination: { total_pages: 0, total_records: 0, current_page: 0, records_per_page: 0 }
            },
          });
        }
      }
    } else {
      // If user is not a participant in the chat, emit invalid chat event
      if (data.message_type) {
        emitEvent([socket.id], "message_list_with_specific_type", "Invalid Chat");
      }
      else {
        emitEvent([socket.id], "message_list", "Invalid Chat");
      }
    }

  }
  catch (error) {
    console.error("message_list error:", error);
    emitEvent([socket.id], "message_list", { Records: [], pagination: null, message: error.message });
  }
}

module.exports = {
  message_list
};
