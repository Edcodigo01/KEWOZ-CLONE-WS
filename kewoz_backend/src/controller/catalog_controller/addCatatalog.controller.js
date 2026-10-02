const catlog_service = require('../../service/repository/catalog.service');
const { generalResponse } = require("../../helper/response.helper");
const { DEMO_USER_ID } = require('../../helper/demo_data.helper');
async function addCatalog(req, res) {
    try {
        const user_id = req.authData.user_id;
        const isDemoUser = process.env.IS_CLIENT != "true" && DEMO_USER_ID.includes(user_id);

        console.log("User ID from authData:", isDemoUser , user_id, "DEMO_USER_ID:", DEMO_USER_ID);

        // if (isDemoUser) {
        //     return generalResponse(
        //         res, // response object
        //         { success: false }, // response data
        //         "User not deleted", // message
        //         false, // responseType (failure)
        //         true, // show toast
        //         // HTTP status code
        //     );
        // } 
        if(!user_id){
            return generalResponse(res, {}, "User not found", false, true, 404);
        }
        const {price, title, description, country_of_origin} = req.body;
        // if(!price || !title || !description || !country_of_origin){
        //     return generalResponse(res, {}, "Missing required fields: price, title, description, country_of_origin", false, true, 400);
        // }
        let catalog_images = [];
        if(req.files){
            catalog_images = req.files.map(file => file.path);
        }
        const catalogData = {
            price,
            title,
            description,
            country_of_origin,
            catalog_images,
            user_id
        };
        const catalog = await catlog_service.addCatalog(catalogData);
        return generalResponse(res, catalog, "Catalog added successfully", true, false, 200);
    } catch (error) {
        return generalResponse(res, {}, error.message, false, true, 500);
    }
}

module.exports = {
    addCatalog
}
    