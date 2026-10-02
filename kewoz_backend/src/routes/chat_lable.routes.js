const express = require("express");
const router = express.Router();
const { authMiddleware, authorize } = require("../middleware/authMiddleware");

const { add_lable, get_lable_list, update_lable, apply_lable_to_chat } = require("../controller/chat_lable_controller/chat_lable.controller");

router.use(authMiddleware)
router.post("/add", authorize(["business"]), add_lable);
router.post("/get", get_lable_list);
router.post("/update", authorize(["business"]), update_lable);
router.post("/apply_to_chat", authorize(["business"]), apply_lable_to_chat);

module.exports = router;
