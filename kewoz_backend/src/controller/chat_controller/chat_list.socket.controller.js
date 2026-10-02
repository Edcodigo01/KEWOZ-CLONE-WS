  const chat_service = require("../../service/repository/Chat.service");
  const filterData = require("../../helper/filter.helper");
  const participant_service = require("../../service/repository/Participant.service");
  const message_seen_service = require("../../service/repository/Message_seen.service");
  const { getUser } = require("../../service/repository/user.service");
  const { User, Message, Call, Story, Chat_lable, Participant, Chat } = require("../../../models");
  const { Op, Sequelize } = require("sequelize"); // Ensure you're importing Op

  async function chat_list(socket, data, emitEvent, archived_chat = false) {
    try {
      // 1️⃣ Validate the logged-in user
      const isUser = await getUser({ user_id: socket.authData.user_id });
      if (!isUser) {
        return emitEvent([socket.id], "chat_list", { Chats: [], pagination: null, message: "User not found." });
      }
      attributes = [
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
        "user_type"

      ];
      let user_data = { ...isUser.toJSON() };
      const keysToRemove = [
        "password",
        "otp",
        "id_proof",
        "selfie",
        "device_token",
      ];
      user_data = filterData(user_data, keysToRemove, "key");

      const userId = Number(user_data.user_id); // Ensure user_id is numeric

      // 3️⃣ Define what message data to include in each chat
      const includeOptions = [
        {
          model: Participant,
          as: "participants",
          where: {
            user_id: userId
          },
          include: [
            {
              model: Chat_lable,
              as: "chat_lable_1",
              where: { status: true },
              required: false,
            },
            {
              model: Chat_lable,
              as: "chat_lable_2",
              where: { status: true },
              required: false,
            },
            {
              model: Chat_lable,
              as: "chat_lable_3",
              where: { status: true },
              required: false,
            }
          ]
        },
        {
          model: Message,
          where: {
            [Op.and]: [
              // Exclude deleted messages for current user
              Sequelize.literal(
                `NOT ("Message"."deleted_for" @> ARRAY[${userId}::numeric])`
              ),
              { message_type: { [Op.ne]: "block" } } // Exclude "block" type
            ]
          },


          include: [
            {
              model: User, // Sender of the message
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
                "user_type"
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
                  "user_type"
                ],
              }],
              where: {
                is_expired: false
              }
            },
            {
              model: User, // Assuming User is associated with Message
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
              model: Call, // If message is related to a call
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
          ],
          order: [["createdAt", "DESC"]], // Only latest message per chat
          limit: 1,

        },
      ];

      // 4️⃣ Get all chats the user is a participant in
      let getChats_of_users
      if (data.lable_id) {

        getChats_of_users =
          await participant_service.getParticipantWithoutPagenation({
            user_id: socket.authData.user_id,
            [Op.or]: [
              { lable_id_1: data.lable_id },
              { lable_id_2: data.lable_id },
              { lable_id_3: data.lable_id },
            ]
          });
      }
      else {
        getChats_of_users =
          await participant_service.getParticipantWithoutPagenation({
            user_id: socket.authData.user_id,
          });
      }


      if (getChats_of_users.Records.length > 0) {
        const allChatIds = getChats_of_users.Records.map(c => c.chat_id);

        // 5️⃣ Filter archived/non-archived in a SINGLE query instead of N queries
        const archiveCondition = archived_chat
          ? Sequelize.literal(`("archived_for" @> ARRAY[${userId}]::numeric[])`)
          : Sequelize.literal(`NOT ("archived_for" @> ARRAY[${userId}]::numeric[])`);

        const filteredChats = await Chat.findAll({
          where: {
            chat_id: { [Op.in]: allChatIds },
            [Op.and]: [
              archiveCondition,
              ...(!archived_chat ? [Sequelize.literal(`NOT ("deleted_for" @> ARRAY[${userId}]::numeric[])`)] : []),
              { updatedAt: { [Op.gte]: new Date(data.updatedAt || '1970-01-01T00:00:00Z') } },
            ],
          },
          attributes: ['chat_id'],
          order: [['updatedAt', 'DESC']],
        });

        const chatIds = filteredChats.map(c => c.chat_id);

        const includeOptionsUser = [
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
              "updatedAt",
              "createdAt",
              "mobile_num",
              "user_type"
            ],
          },
        ];

        // 🔹 Pagination setup
        let total_records = chatIds.length;
        let currentPage = data?.page || 1;
        let pageSize = data?.pageSize || 10;
        let total_pages = Math.ceil(total_records / pageSize);

        const startIndex = (currentPage - 1) * pageSize;
        const paginatedChatIds = chatIds.slice(startIndex, startIndex + pageSize);

        // 7️⃣ Fetch all paginated chats in PARALLEL (all 3 queries per chat run concurrently)
        const results = await Promise.all(
          paginatedChatIds.map(async (chatId) => {
            const [unseenCount, users, chats] = await Promise.all([
              message_seen_service.getMessageSeenCount({
                andConditions: {
                  chat_id: chatId,
                  user_id: isUser.user_id
                },
                orConditions: {
                  message_seen_status: ["delivered", "sent"],
                },
              }),
              participant_service.getParticipantWithoutPagenation(
                {
                  chat_id: chatId,
                  user_id: { [Op.ne]: isUser.user_id },
                },
                includeOptionsUser
              ),
              chat_service.getChats(
                { chat_id: chatId },
                includeOptions,
                { page: 1, pageSize: 1 }
              ),
            ]);

            if (users.Records.length > 0) {
              const PeerUserData = users.Records[0].User;

              if (chats.Records.length > 0) {
                chats.Records = chats.Records.map(record => ({
                  ...record,
                  unseen_count: unseenCount.count
                }));
                return { Records: chats.Records, PeerUserData };
              } else {
                return { Records: [], PeerUserData };
              }
            }
            return null;
          })
        );

        const response = results.filter(Boolean);

        // 8️⃣ Emit response based on archived flag
        if (archived_chat) {
          emitEvent([socket.id], "archived_chat_list", {
            pagination: {
              total_pages,
              total_records,
              current_page: currentPage,
              records_per_page: pageSize,
            },
            Chats: response,
          });
        }
        else {
          emitEvent([socket.id], "chat_list", {
            pagination: {
              total_pages,
              total_records,
              current_page: currentPage,
              records_per_page: pageSize,
            },
            Chats: response,
          });
        }

      } else {
        // No chats found for this user
        emitEvent([socket.id], archived_chat ? "archived_chat_list" : "chat_list", { Chats: [], pagination: null });

      }
    } catch (error) {
      return emitEvent([socket.id], archived_chat ? "archived_chat_list" : "chat_list", { Chats: [], pagination: null, message: error.message });

    }
  }

  module.exports = {
    chat_list,
  };
