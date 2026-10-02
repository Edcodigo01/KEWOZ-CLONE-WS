const express = require("express");
const router = express.Router();
const { getCategories } = require("../controller/categories_controller/getCategories.controller");

router.get("/get-categories", getCategories);

module.exports = router;
