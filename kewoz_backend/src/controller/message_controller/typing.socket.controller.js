const participant_service = require("../../service/repository/Participant.service");
const { User } = require("../../../models");

const USER_ATTRIBUTES = [
  "profile_pic", "banner_image", "user_id", "full_name", "user_name",
  "email", "country_code", "country", "gender", "description",
  "profile_verification_status", "login_verification_status", "socket_ids",
];

const includeOptions = [{ model: User, as: "User", attributes: USER_ATTRIBUTES }];

async function typing(socket, data, emitEvent) {
  const user_id = socket.authData.user_id;

  // Attach current user's ID to event data
  data.user_id = user_id;

  if (!data.chat_id) return;

  // Check user is a participant of the target chat, then get all other participants
  const userChats = await participant_service.getParticipantWithoutPagenation({ user_id });
  const isInChat = userChats.Records.some((c) => c.chat_id == data.chat_id);
  if (!isInChat) return;

  const chatParticipants = await participant_service.getParticipantWithoutPagenation(
    { chat_id: data.chat_id },
    includeOptions
  );

  for (const chat of chatParticipants.Records) {
    if (chat.User.user_id != user_id) {
      emitEvent(chat.User.socket_ids, "typing", data);
    }
  }
}

module.exports = {
  typing,
};
