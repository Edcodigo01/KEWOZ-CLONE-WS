const express = require("express");
const router = express.Router();
const { addCatalog } = require("../controller/catalog_controller/addCatatalog.controller");
const { authMiddleware, authorize } = require("../middleware/authMiddleware");
const { getCatalogs } = require("../controller/catalog_controller/getCatalogs.controller");
const { updateCatalog, add_views } = require("../controller/catalog_controller/updateCatatalog.controller");
const { addCatalogImage, deleteCatalogImage } = require("../controller/catalog_controller/updateCatatalog.controller");

router.use(authMiddleware)
router.post("/add", authorize(["business"]),addCatalog);
router.post("/get", getCatalogs);
router.post("/add-view", add_views);
router.post("/update", authorize(["business"]), updateCatalog);
router.post("/add-catalog-image", authorize(["business"]), addCatalogImage);
router.post("/delete-catalog-image", authorize(["business"]), deleteCatalogImage);

module.exports = router;
