const express = require('express');
const {getConfig} = require('../controller/config_controller/get_config.controller');
const {updateConfig} = require('../controller/config_controller/update_config.controller');
const {deactivatePurchaseCode} = require('../controller/config_controller/deactivate_purchase_code.controller');
const {getSplashAd} = require('../controller/config_controller/splash_ad.controller');
const {getBannerAd} = require('../controller/config_controller/banner_ad.controller');
const { demoGuard } = require('../middleware/demoGaurd');
const router = express.Router();

router.get('/', getConfig);
router.put('/', demoGuard, updateConfig);

router.post('/deactivate', demoGuard, deactivatePurchaseCode);

// Public endpoints — no auth required
router.get('/splash-ad', getSplashAd);
router.get('/get-splash-ad', getSplashAd);
router.get('/get-banner-ad', getBannerAd);

module.exports = router;