// const participant_service = require("../../service/repository/Participant.service");
// const message_service = require("../../service/repository/Message.service");
// const { getUser } = require("../../service/repository/user.service");
// const { DEMO_CHAT_ID } = require("../../helper/demo_data.helper");

// async function delete_for_everyone(socket, data, emitEvent) {
//   try {
//     const user_id = socket.authData.user_id;

//     if (!data.chat_id || !data.message_id) {
//       return emitEvent([socket.id], "message_list", "Chat id and message Id are required");
//     }

//     const isDemoChat = process.env.IS_CLIENT != "true" && DEMO_CHAT_ID.includes(Number(data.chat_id));
//     if (isDemoChat) {
//       return emitEvent([socket.id], "delete_for_everyone", "This is demo chat you can not make changes in it", (success = false));
//     }

//     const message = await message_service.getMessage(data);

//     if (!message) {
//       return emitEvent([socket.id], "delete_for_everyone", "Message not found.", (success = false));
//     }

//     if (message.sender_id != user_id) {
//       return emitEvent([socket.id], "delete_for_everyone", "You are not the sender of this message.", (success = false));
//     }

//     const deleted_message = await message_service.updateMessage(
//       { message_id: Number(data.message_id) },
//       {
//         deleted_for_everyone: true,
//         message_content: "This message was deleted.",
//         pinned: false,
//         pinned_till: null,
//         pin_lifetime: null,
//         starred_for: [],
//       }
//     );

//     if (deleted_message.length > 0) {
//       const participants = await participant_service.getParticipantWithoutPagenation({ chat_id: message.chat_id });
//       const users = await Promise.all(participants.Records.map((p) => getUser({ user_id: p.user_id })));
//       const socket_ids = users.flatMap((u) => u.socket_ids);
//       emitEvent([...socket_ids], "delete_for_everyone", deleted_message[1][0].toJSON());
//     }
//   } catch (err) {
//     throw new Error(err.message || "Failed to delete the message.");
//   }
// }

// module.exports = {
//   delete_for_everyone,
// };
const participant_service = require("../../service/repository/Participant.service");
const message_service = require("../../service/repository/Message.service");
const { getUser } = require("../../service/repository/user.service");
const { DEMO_CHAT_ID } = require("../../helper/demo_data.helper");
const { chat_list } = require("../chat_controller/chat_list.socket.controller");

async function delete_for_everyone(socket, data, emitEvent) {
  try {
    const user_id = socket.authData.user_id;

    if (!data.chat_id || !data.message_id) {
      return emitEvent([socket.id], "message_list", "Chat id and message Id are required");
    }

    const isDemoChat = process.env.IS_CLIENT != "true" && DEMO_CHAT_ID.includes(Number(data.chat_id));
    if (isDemoChat) {
      return emitEvent([socket.id], "delete_for_everyone", "This is demo chat you can not make changes in it", (success = false));
    }

    const message = await message_service.getMessage(data);

    if (!message) {
      return emitEvent([socket.id], "delete_for_everyone", "Message not found.", (success = false));
    }

    if (message.sender_id != user_id) {
      return emitEvent([socket.id], "delete_for_everyone", "You are not the sender of this message.", (success = false));
    }

    const deleted_message = await message_service.updateMessage(
      { message_id: Number(data.message_id) },
      {
        deleted_for_everyone: true,
        message_content: "This message was deleted.",
        pinned: false,
        pinned_till: null,
        pin_lifetime: null,
        starred_for: [],
      }
    );

if (deleted_message.length > 0) {
  const participants = await participant_service.getParticipantWithoutPagenation({
    chat_id: message.chat_id,
  });

  const users = await Promise.all(
    participants.Records.map((p) => getUser({ user_id: p.user_id }))
  );

  const socket_ids = users.flatMap((u) => u.socket_ids);

  // 🔹 Emit delete event
  emitEvent(
    [...socket_ids],
    "delete_for_everyone",
    deleted_message[1][0].toJSON()
  );

  // 🔹 Update chat list for all participants
  for (const user of users) {
    for (const sid of user.socket_ids) {
      const fakeSocket = {
        id: sid,
        authData: { user_id: user.user_id },
      };

      await chat_list(fakeSocket, {}, emitEvent);
    }
  }
}

  } catch (err) {
    throw new Error(err.message || "Failed to delete the message.");
  }
}

module.exports = {
  delete_for_everyone,
};
