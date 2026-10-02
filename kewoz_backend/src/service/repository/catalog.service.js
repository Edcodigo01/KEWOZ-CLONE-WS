const {Catalog, Catalog_images} = require("../../../models");

async function addCatalog(catalogData) {
    try {
        let catalog = await Catalog.create(catalogData);
        if(catalogData.catalog_images){
            await Catalog_images.bulkCreate(catalogData.catalog_images.map(image => ({
                catalog_id: catalog.catalog_id,
                image: image
            })));
        }
        catalog = await Catalog.findByPk(catalog.catalog_id, {
            include: [
                {
                    model: Catalog_images,
                    as: "Catalog_images",
                },
            ],
        });
        return catalog;
    } catch (error) {
        throw error;
    }
}

async function getCatalogs(user_id, page = 1, limit = 10) {
    try {
        let catalogs = await Catalog.findAll({
            where: {
                user_id: user_id
            },
            include: [
                {
                    model: Catalog_images,
                    as: "Catalog_images",
                },
            ],
            limit: limit,
            offset: (page - 1) * limit,
        });
        const total = await Catalog.count({
            where: {
                user_id: user_id
            }
        });
        return {
            catalogs,
            pagination: {
                total_pages: Math.ceil(total / limit),
                total_records: total,
                current_page: page,
                records_per_page: limit,
            },
        };
    } catch (error) {
        throw error;
    }
}

async function updateCatalog(catalogData) {
    try {
        let catalog = await Catalog.update(catalogData, {
            where: {
                catalog_id: catalogData.catalog_id
            }
        });
        catalog = await Catalog.findByPk(catalog.catalog_id, {
            include: [
                {
                    model: Catalog_images,
                    as: "Catalog_images",
                },
            ],
        });
        return catalog;
    } catch (error) {
        throw error;
    }
}

async function getMyCatalog(user_id, catalog_id, include = []){
    try {
        let catalog = await Catalog.findOne({
            where: {
                catalog_id: catalog_id,
                user_id: user_id
            },
            include: include,
        });
        return catalog;
    } catch (error) {
        throw error;
    }
}

async function addCatalogImage(catalog_id, image){
    try {
        
        let catalog = await Catalog_images.create({
            catalog_id: catalog_id,
            image: image
        });
        return catalog;
    } catch (error) {
        throw error;
    }
}

async function deleteCatalogImage(catalog_id,catalog_image_id){
    try {
        let catalog = await Catalog_images.destroy({
            where: {
                catalog_id: catalog_id,
                catalog_image_id
            }
        });
        return catalog;
    } catch (error) {
        throw error;
    }
}

async function getCatalogImage(catalog_id, catalog_image_id){
    try {
        let catalog = await Catalog_images.findOne({
            where: {
                catalog_id: catalog_id,
                catalog_image_id
            }
        });
        return catalog;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    addCatalog,
    getCatalogs,
    updateCatalog,
    getMyCatalog,
    addCatalogImage,
    deleteCatalogImage,
    getCatalogImage
}
