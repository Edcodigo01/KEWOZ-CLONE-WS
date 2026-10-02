const { Router } = require("express")



const userRoutes = require("./user.routes");

const blockRoutes = require("./block.routes")

const reportRoutes = require("./report.routes")

const chatRoutes = require("./chat.routes")

const project_conf_routes = require("./project_conf.routes")

const storyRoutes = require("./story.routes")

const contactRoutes = require("./contacts.routes")

const adminRoutes = require("./admin.routes")

const configRoutes = require("./config.routes")

const dashboardRoutes = require("./dashboard.routes")

const avatarRoutes= require("./avatar.route")

const { sendPushNotification } = require("../service/common/oneSignal.service");

const language_routes = require("./Language.routes"); 

const callRoutes = require("./call.routes");

const catalogRoutes = require("./catalog.routes");

const categoryRoutes = require("./category.routes");

const chatLableRoutes = require("./chat_lable.routes");

const authRoutes = require('./auth.routes');
const { getPrivacyPolicy, getTermsConditions, getSupport } = require('../controller/config_controller/public_pages.controller');
const router = Router();



router.use('/users', userRoutes);

router.use('/block', blockRoutes);

router.use('/report', reportRoutes);

router.use('/chat', chatRoutes);

// router.use("/project-conf", project_conf_routes)

router.use("/story", storyRoutes)

router.use("/contacts", contactRoutes)

router.use("/admin", adminRoutes)

router.use("/config", configRoutes)

router.use("/dashboard", dashboardRoutes)

router.use('/avatar',avatarRoutes)

router.use("/language", language_routes);

router.use("/call", callRoutes);

router.use("/catalog", catalogRoutes);

router.use("/category", categoryRoutes);

router.use("/chat_lable", chatLableRoutes);

router.use('/v1/auth', authRoutes);

// Public pages for Google Play / App Store compliance (no auth required)
router.get('/privacy-policy', getPrivacyPolicy);
router.get('/terms-and-conditions', getTermsConditions);
router.get('/support', getSupport);

// Firebase Auth Setup Page (temporary admin route)
const path = require('path');

router.get('/firebase-setup', (req, res) => {

    res.sendFile(path.join(__dirname, '../../public/firebase-setup.html'));

});



module.exports = router;