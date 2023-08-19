const express = require("express");
const authUser = require("../middlewares/auth");

const router = express.Router();
const { searchUser, getChats } = require("../controllers/friends");

router.route("/getchats/:chatId").get(authUser, getChats);
router.route("/search").post(authUser, searchUser);

module.exports = router;
