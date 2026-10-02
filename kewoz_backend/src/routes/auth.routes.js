const express = require('express');
const { firebaseVerify } = require('../controller/auth_controller/firebase_auth.controller');
const { webLogin } = require('../controller/auth_controller/web_auth.controller');
const router = express.Router();

router.post('/firebase-verify', firebaseVerify);

router.post('/web-login', webLogin);

module.exports = router;
