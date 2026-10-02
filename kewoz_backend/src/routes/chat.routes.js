const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');

const {getMessages} = require("../controller/message_controller/get_messages.controller");
const {rawUpload} = require("../controller/message_controller/raw_upload.controller");
const {testUpload} = require("../controller/message_controller/test_upload.controller");
const {uploadFile} = require('../controller/message_controller/upload_file.controller');
const {uploadBase64} = require('../controller/message_controller/upload_base64.controller');
const {sendMessage} = require('../controller/message_controller/send_message.controller');
const {createGroup }= require('../controller/chat_controller/create_group.controller');
const {updateChat} = require('../controller/chat_controller/update_chat.controller');
const {promoteAsGroupAdmin} = require('../controller/chat_controller/promote_group_admin.controller');
const {addMember} = require('../controller/chat_controller/add_member_to_group.controller');
const {removeMember} = require('../controller/chat_controller/remove_member_to_group.controller');
const {groupMembers} = require('../controller/chat_controller/group_members.controller');
const {forwardMessage} = require('../controller/message_controller/forward_message.controller');
const {starUnstarMessage} = require('../controller/message_controller/star_unstar_message.controller');
const {pinUnpinMessage} = require('../controller/message_controller/pin_unpin_message.controller');
const {votePoll} = require('../controller/message_controller/vote_poll.controller');
const {chatMedia} = require('../controller/chat_controller/chat_media.controller');
const {starredMessageList} = require('../controller/message_controller/starred_message_list.controller');
const {clearChat} = require('../controller/chat_controller/clear_chat.controller');
const {call_history} = require('../controller/chat_controller/call_history.controller');
const {chatListRest, searchChats} = require('../controller/chat_controller/search_chats.controller');
const {searchMessage} = require("../controller/chat_controller/search_message.controller");
 const { lockChat, unlockChat ,resetChatPin , RemoveChatLock } = require('../controller/chatlock/chatlock.controller');

const upload = require("../middleware/upload");

const router = express.Router();


// Auth follow Routes
router.use(authMiddleware)

router.post("/upload-base64", uploadBase64);
router.post("/get-messages", getMessages);
router.post("/test-upload2", testUpload);
router.post("/raw-upload", express.raw({type: "multipart/form-data", limit: "50mb"}), rawUpload);
router.post("/test-upload3", upload.single("files"), testUpload);
router.post("/upload-file", upload.any(), uploadFile);
router.post("/send-message", upload.any(), sendMessage);
router.post("/create-group", createGroup);
router.post("/update-group", updateChat);
router.post("/create-group-admin", promoteAsGroupAdmin);
router.post("/add-member", addMember);
router.post("/remove-member", removeMember);
router.post("/group-members", groupMembers);
router.post("/forward-message", forwardMessage);
router.post("/star-unstar-message", starUnstarMessage);
router.post("/pin-unpin-message", pinUnpinMessage);
router.post("/vote-poll", votePoll);
router.post("/chat-media", chatMedia);
router.post("/starred-messages", starredMessageList);
router.post("/clear-chat", clearChat);
router.post("/call-history" , call_history)
router.post("/chat-list", chatListRest);
router.post("/search-chat" ,searchChats)
router.post("/search-message", searchMessage);
router.post("/lock-chat", lockChat);
router.post("/unlock-chat", unlockChat);
router.post("/reset-chat-pin", resetChatPin);
router.post("/remove-chat-lock", RemoveChatLock);
module.exports = router;