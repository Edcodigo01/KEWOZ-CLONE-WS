const { generalResponse } = require("../../helper/response.helper");
const category_service = require("../../service/repository/category.service");
async function getCategories(req, res){
    try {
        const categories = await category_service.getAllCategories();
        return generalResponse(res, categories, "Categories found", true, false, 200);
    } catch (error) {
        return generalResponse(res, {}, error.message, false, true, 500);
    }
}

module.exports = {
    getCategories
}
