const participant_service = require("../../service/repository/Participant.service");
const message_service = require("../../service/repository/Message.service");
const message_seen_service = require("../../service/repository/Message_seen.service");
const { getUser } = require("../../service/repository/user.service");

async function real_time_message_seen(socket, data, emitEvent) {
  const user_id = socket.authData.user_id;

  const isMessage = await message_service.getMessages({
    message_id: data.message_id,
    chat_id: data.chat_id,
  });

  if (!isMessage) return;

  const [update_message_seen, aa] = await Promise.all([
    message_seen_service.updateMessageSeen(
      { message_id: data.message_id, user_id },
      { message_seen_status: data.status }
    ),
    participant_service.getParticipantWithoutPagenation({ chat_id: data.chat_id }),
  ]);

  const seen_user_count = await message_seen_service.getMessageSeenCount({
    andConditions: {
      chat_id: data.chat_id,
      message_id: data.message_id,
      message_seen_status: "seen",
    },
  });

  if (seen_user_count.count == aa.Records.length && update_message_seen[0] > 0) {
    const update_message = await message_service.updateMessage(
      { message_id: Number(data.message_id) },
      { message_seen_status: "seen" }
    );

    if (update_message[0] > 0) {
      const sender = await getUser({ user_id: isMessage.Records[0].sender_id });
      emitEvent(sender.socket_ids, "real_time_message_seen", update_message[1][0].toJSON());
    }
  }
}

module.exports = {
  real_time_message_seen,
};
