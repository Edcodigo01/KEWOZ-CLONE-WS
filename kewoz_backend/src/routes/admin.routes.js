const express = require('express');

const admin_auth_controller = require('../controller/admin_controller/login_admin.controller');
const admin_details_controller = require('../controller/admin_controller/admin.details.controller');
const admin_controller = require('../controller/admin_controller/admin.controller');
const admin_cnts_controller = require('../controller/admin_controller/counts.controller');
const { authMiddleware } = require('../middleware/authMiddleware');
const { isAdmin } = require('../service/repository/Admin.service');
const language_controller = require('../controller/language_controller/language_controller')
const notification_controller = require('../controller/Pushnotification.controller');
const { demoGuard } = require('../middleware/demoGaurd');
const { findUserAdmin } = require('../controller/user_controller/find_user.controller');
const mass_message_controller = require('../controller/admin_controller/mass_message.controller');
const upload = require('../middleware/upload');
const router = express.Router();

router.post('/login', admin_auth_controller.login_admin);
router.post('/get-language', language_controller.listLanguage);
router.post('/get-language-words', language_controller.listLanguageKeywords);

// Auth follow Routes
router.use(authMiddleware);
router.use(isAdmin);
router.get('/', admin_details_controller.get_admin_details);
router.put('/', admin_details_controller.update_admin);
router.put('/block-user', demoGuard, admin_controller.blockUser);
router.put('/block-group', demoGuard, admin_controller.blockGroup);
router.put('/update-group', demoGuard, admin_controller.updateGroup);
router.post('/delete-group', demoGuard, admin_controller.deleteGroup);

// Language Routes
router.post('/add-language', demoGuard, language_controller.add_new_language);
router.post('/update-language', demoGuard, language_controller.update_Language);
router.post('/translate-all-keywords', language_controller.translate_all_keywords);
router.post('/translate-single-keyword', language_controller.translate_single_keywords);
router.post('/add-keyword', language_controller.add_new_keyword);

router.post("/users", admin_controller.usersList);
router.post("/users/findUserAdmin", findUserAdmin);
router.post('/calls-list', admin_controller.getCallList)
router.post("/group-chats", admin_controller.getGroupChats);

router.get("/users-cnt", admin_cnts_controller.getUsersCounts);
router.get("/users-vs-business-cnt", admin_cnts_controller.getUsersTypesCounts);
router.get("/users-cnt-country-wise", admin_cnts_controller.getUsersCountCountryWise);
router.get("/users-cnt-country-wise-last-30-mins", admin_cnts_controller.getUsersCountCountryWiselast30mins);
router.get("/groups-cnt", admin_cnts_controller.getGroupChatsCnt);
router.get("/calls-cnt", admin_cnts_controller.getCallsCnt);
router.get("/users-cnt-by-login-type", admin_cnts_controller.getUsersCntByLoginType);
router.get("/users-list-by-platform", admin_cnts_controller.getUsersListByPlatform);
router.post("/yearly-new-users-and-grps", admin_cnts_controller.getYearlyDataOfNewUsersAndGrps);
router.get("/new-users-of-week", admin_cnts_controller.weeklyNewUsers);
router.post("/yearly-calls-data", admin_cnts_controller.yearlyCallsData);
router.post(
  "/get-daily-active-users",
  admin_cnts_controller.dailyActiveUserscount
);
router.get(
  "/get-category-insights",
  admin_controller.getCategoryInsights
);
router.get(
  "/get-categories",
  admin_controller.getCategoryInsightsWithDelted
);
router.post('/new-user-notifications', admin_controller.newUserNotifications );
router.get('/is-notification-available', admin_controller.newNotifications)

router.post('/get-block-list', admin_controller.getBlockList);
router.post('/deactivate', demoGuard,admin_controller.deactivate);


router.post('/notification', demoGuard, notification_controller.broadcastMessage);
router.post('/list-broadcast-notification', notification_controller.getbroadcastMessage);

router.post('/add-category', demoGuard, admin_controller.addCategory);
router.post('/edit-category', demoGuard,admin_controller.editCategory);
router.post('/delete-user', demoGuard, admin_controller.deleteSingleUser);

router.post('/check-username', demoGuard, admin_controller.checkUsername);
router.post('/check-phone', demoGuard, admin_controller.checkPhone);
router.post('/add-user', demoGuard, upload.fields([{ name: 'profile_pic', maxCount: 1 }]), admin_controller.addUser);

// Mass messages (broadcast with filters)
router.post(
  '/mass-message/send',
  demoGuard,
  upload.single('image'),
  mass_message_controller.send
);
router.post(
  '/mass-message/preview-count',
  mass_message_controller.previewCount
);

module.exports = router;