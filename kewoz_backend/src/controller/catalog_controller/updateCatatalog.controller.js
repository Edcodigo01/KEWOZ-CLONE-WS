const catlog_service = require('../../service/repository/catalog.service');
const { generalResponse } = require("../../helper/response.helper");
const fs = require('fs');
const { updateUser, getUser } = require('../../service/repository/user.service');
const { DEMO_USER_ID } = require('../../helper/demo_data.helper');
async function updateCatalog(req, res) {
    try {
        const user_id = req.authData.user_id;
        if (!user_id) {
            return generalResponse(res, {}, "User not found", false, true, 404);
        }
        const isDemoUser = process.env.IS_CLIENT != "true" && DEMO_USER_ID.includes(user_id);

        if (isDemoUser) {
            return generalResponse(
                res, // response object
                { success: false }, // response data
                "User not deleted", // message
                false, // responseType (failure)
                true, // show toast
                // HTTP status code
            );
        } 
        const catalog_id = req.body.catalog_id;

        if (!catalog_id) {
            return generalResponse(res, {}, "Catalog id is required", false, true, 400);
        }
        let catalog = await catlog_service.getMyCatalog(user_id, catalog_id);
        if (!catalog) {
            return generalResponse(res, {}, "Catalog not found", false, true, 404);
        }
        const { price, title, description, country_of_origin } = req.body;

        const catalogData = {
            catalog_id,
            price,
            title,
            description,
            country_of_origin,
            user_id
        };
        catalog = await catlog_service.updateCatalog(catalogData);
        catalog = await catlog_service.getMyCatalog(user_id, catalog_id);

        return generalResponse(res, catalog, "Catalog updated successfully", true, false, 200);
    } catch (error) {

        return generalResponse(res, {}, error.message, false, true, 500);
    }
}

async function addCatalogImage(req, res) {
    try {
        const user_id = req.authData.user_id;
        if (!user_id) {
            return generalResponse(res, {}, "User not found", false, true, 404);
        }
        const isDemoUser = process.env.IS_CLIENT != "true" && DEMO_USER_ID.includes(user_id);

        if (isDemoUser) {
            return generalResponse(
                res, // response object
                { success: false }, // response data
                "User not deleted", // message
                false, // responseType (failure)
                true, // show toast
                // HTTP status code
            );
        } 
        const catalog_id = req.body.catalog_id;
        if (!catalog_id) {
            return generalResponse(res, {}, "Catalog id is required", false, true, 400);
        }
        let catalog = await catlog_service.getMyCatalog(user_id, catalog_id);
        if (!catalog) {
            return generalResponse(res, {}, "Catalog not found", false, true, 404);
        }
        if (!req.files) {
            return generalResponse(res, {}, "Image is required", false, true, 400);
        }
       
        if (req.files && req.files.length > 0) {
            const images = req.files.map(file => file.path);

            // Loop over each image and call your service
            const catalogImages = await Promise.all(
                images.map(img => catlog_service.addCatalogImage(catalog_id, img))
            );

            catalog = catalogImages; // all created images
        }


        return generalResponse(res, catalog, "Catalog updated successfully", true, false, 200);
    } catch (error) {
        return generalResponse(res, {}, error.message, false, true, 500);
    }
}

async function add_views(req, res) {
    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ message: "user_id is required" });
        }

        // 1. Get the user
        const user = await getUser({ user_id }, [], [], true);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. Prepare today's date
        const today = new Date().toISOString().split("T")[0];

        // 3. Get current catalog_views array
        const catalogViews = user.catalog_views || [];

        // 4. Check if today's entry exists
        const existingView = catalogViews.find(v => v.date === today);

        if (existingView) {
            existingView.views += 1; // increment views
        } else {
            catalogViews.push({ date: today, views: 1 }); // add new date
        }

        // 5. Update user
        await updateUser({ catalog_views: catalogViews }, { user_id });


        return generalResponse(res, {}, "Catalog View updated successfully", true, false, 200);
    } catch (error) {
        
        return generalResponse(res, {}, error.message, false, true, 500);
    }
}

async function deleteCatalogImage(req, res) {
    try {
        const user_id = req.authData.user_id;
        if (!user_id) {
            return generalResponse(res, {}, "User not found", false, true, 404);
        }
        const isDemoUser = process.env.IS_CLIENT != "true" && DEMO_USER_ID.includes(user_id);

        if (isDemoUser) {
            return generalResponse(
                res, // response object
                { success: false }, // response data
                "User not deleted", // message
                false, // responseType (failure)
                true, // show toast
                // HTTP status code
            );
        } 
        const catalog_id = req.body.catalog_id;
        if (!catalog_id) {
            return generalResponse(res, {}, "Catalog id is required", false, true, 400);
        }
        let catalog = await catlog_service.getMyCatalog(user_id, catalog_id);
        if (!catalog) {
            return generalResponse(res, {}, "Catalog not found", false, true, 404);
        }
        const catalog_image_id = req.body.catalog_image_id;
        if (!catalog_image_id) {
            return generalResponse(res, {}, "Catalog image id is required", false, true, 400);
        }
        let catalog_image = await catlog_service.deleteCatalogImage(catalog_id, catalog_image_id);
        if (!catalog_image) {
            return generalResponse(res, {}, "Catalog image not found", false, true, 404);
        }
        if (catalog_image.image) {
            fs.existsSync(catalog_image.image) && fs.unlinkSync(catalog_image.image);
        }
        catalog = await catlog_service.deleteCatalogImage(catalog_id, catalog_image_id);
        return generalResponse(res, catalog, "Catalog image deleted successfully", true, false, 200);
    } catch (error) {
        return generalResponse(res, {}, error.message, false, true, 500);
    }
}

module.exports = {
    updateCatalog,
    addCatalogImage,
    deleteCatalogImage,
    add_views
}
