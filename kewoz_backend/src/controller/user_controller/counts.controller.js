const { generalResponse } = require("../../helper/response.helper");
const { getblock } = require("../../service/repository/Block.service");
const { getMessages } = require("../../service/repository/Message.service");
const { Op } = require("sequelize");
const { Sequelize, User, Chat, Broadcast_push_notification } = require("../../../models");

async function counts(req, res) {
  try {
    // user is already fetched and attached by authMiddleware — no extra DB call needed
    const user_id = req.user.user_id;
    const { page = 1, pageSize = 1 } = req.body;

    const blockPayload = { user_id };
    const includeOptions = [{ model: User, as: "blocked", blockPayload }];

    // Run all three independent DB queries in parallel
    const [starred_messages, block_list, unreadCount] = await Promise.all([
      getMessages(
        {
          [Op.and]: [
            Sequelize.literal(`NOT ("Message"."deleted_for" @> ARRAY['${user_id}']::decimal[])`),
            Sequelize.literal(`"Message"."starred_for" @> ARRAY['${user_id}']::decimal[]`),
          ],
        },
        [
          {
            model: User,
            attributes: [
              "user_name", "email", "profile_pic", "banner_image", "user_id",
              "full_name", "country_code", "country", "gender", "description",
              "profile_verification_status", "login_verification_status", "socket_ids",
            ],
          },
          {
            model: Chat,
            attributes: ["chat_id", "chat_type", "group_name", "group_icon"],
          },
        ]
      ),
      getblock(blockPayload, includeOptions, { page, pageSize }),
      Broadcast_push_notification.count({
        where: Sequelize.where(
          Sequelize.literal(`NOT (users @> ARRAY[${user_id}]::integer[])`),
          true
        ),
      }),
    ]);

    return generalResponse(
      res,
      {
        total_stared_messages: starred_messages.Pagination.total_records || 0,
        total_blocked_users: block_list.Pagination.total_records || 0,
        unread_notification_count: unreadCount,
      },
      "counts fetched successfully!!",
      true,
      200
    );
  } catch (error) {
    return generalResponse(res, {}, error.message, false, true, 402);
  }
}

module.exports = { counts };
