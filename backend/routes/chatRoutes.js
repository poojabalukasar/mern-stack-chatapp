const express = require('express');
const { protect } = require( '../middleware/authMiddleware' );
const {accessChat,fetchChats,createGroupChat,renameGroup,addToGroup,removeFromGroup} = require('../controllers/chatController');
const router = express.Router();


router.route("/").post(protect,accessChat);//createing chat
router.route("/").get(protect,fetchChats);

router.route("/group").post(protect,createGroupChat);//creating group chat
router.route("/rename").put(protect,renameGroup);//rename group
router.route("/groupadd").put(protect,addToGroup);
router.route("/groupremove").put(protect,removeFromGroup);


module.exports = router;