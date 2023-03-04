const express = require('express');
const { protect } = require( '../middleware/authMiddleware' );
const router = express.Router();
const {sendMessage,allMessage} = require("../controllers/messageController");

router.route("/").post(protect,sendMessage);
router.route("/:chatId").get(protect,allMessage);

module.exports = router;