const config_service = require('../../service/common/config.service');
const { generalResponse } = require('../../helper/response.helper');

async function deactivatePurchaseCode(req, res) {
    try {
        let config = await config_service.getConfig();
        if (!config) {
            return generalResponse(res, {}, 'Config not found', false, true, 404);
        }
        config = await config_service.updateConfig(
            { purchase_code: '' },
            { config_id: config.config_id }
        );
        return generalResponse(res, config, 'Purchase code deactivated', true, false, 200);
    } catch (error) {
        console.error('Error deactivating purchase code', error);
        return generalResponse(res, {}, error.message, false, true, 500);
    }
}

module.exports = { deactivatePurchaseCode };
