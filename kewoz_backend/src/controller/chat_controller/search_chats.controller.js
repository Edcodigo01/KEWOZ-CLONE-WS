const participant_service = require("../../service/repository/Participant.service");
const chat_service = require("../../service/repository/Chat.service");
const { getUser } = require("../../service/repository/user.service");
const { generalResponse } = require("../../helper/response.helper");
const config_service = require("../../service/common/config.service");

const chatListRest = async (req, res) => {
  const userId = String(req.authData.user_id);
  try {
    const chatIds = await participant_service.getChatIdsByUser(userId);
    if (!chatIds.length) {
      return generalResponse(res, [], "No chats found", true);
    }
    const [user, config, chats] = await Promise.all([
      getUser({ user_id: userId }),
      config_service.getConfig(),
      chat_service.getChatsByIds(chatIds, true, req.authData.user_id),
    ]);
    return generalResponse(res, chats, "Chats found", true);
  } catch (err) {
    console.error("Error in chatListRest:", err);
    return generalResponse(res, null, "Internal server error", false, true, 500);
  }
};

const searchChats = async (req, res) => {
  try {
    const userId = String(req.authData.user_id);
    const { searchText } = req.body;
    const lowerSearch = searchText.toLowerCase();

    const chatIds = await participant_service.getChatIdsByUser(userId);
    if (!chatIds.length) {
      return generalResponse(res, [], "No recent chats found", true);
    }

    // Fetch user, config, and chats in parallel
    const [user, config, chats] = await Promise.all([
      getUser({ user_id: userId }),
      config_service.getConfig(),
      chat_service.getChatsByIds(chatIds, true, req.authData.user_id),
    ]);

    const contacts = Array.isArray(user.contact_details) ? user.contact_details : [];
    const contactNameMap = new Map(
      contacts
        .filter((c) => c.user_id != null && c.name)
        .map((c) => [String(c.user_id), c.name])
    );

    const useContactFlow = config.user_name_flow === false && config.contact_flow === true;
    const results = [];

    for (const chat of chats) {
      if (chat.chat_type === "group") {
        if (chat.group_name?.toLowerCase().includes(lowerSearch)) {
          results.push(chat);
        }
      } else {
        const other = chat.participants.find((p) => String(p.user_id) !== userId);
        if (!other) continue;

        if (useContactFlow) {
          const contactName = contactNameMap.get(String(other.user_id));
          if (contactName && contactName.toLowerCase().includes(lowerSearch)) {
            for (const participant of chat.participants) {
              if (String(participant.user_id) === String(other.user_id) && participant.User) {
                participant.User.full_name = contactName;
                break;
              }
            }
            results.push(chat);
          }
        } else {
          const otherUser = await getUser({ user_id: other.user_id });
          if (otherUser && otherUser.full_name.toLowerCase().includes(lowerSearch)) {
            results.push(chat);
          }
        }
      }
    }

    return generalResponse(res, results, `${results.length} result(s) found`, true);
  } catch (err) {
    console.error("Error in searchChats:", err);
    return generalResponse(res, null, "Internal server error", false, true, 500);
  }
};

module.exports = {
  chatListRest,
  searchChats,
};
