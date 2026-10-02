const catlog_service = require('../../service/repository/catalog.service');
const { generalResponse } = require("../../helper/response.helper");

async function getCatalogs(req, res) {
    try {
        const {user_id, page, limit} = req.body;
        const catalogs = await catlog_service.getCatalogs(user_id, page, limit);
        return generalResponse(res, catalogs, "Catalogs fetched successfully", true, false, 200);
    } catch (error) {
        return generalResponse(res, {}, error.message, false, true, 500);
    }
}   
module.exports = {
    getCatalogs
}
