const express = require("express");
const router = express.Router();
const authUser = require("../middlewares/auth");

const {
  registerUser,
  loginUser,
  checkUsername,
  getUser,
} = require("../controllers/user");

router.route("/register").post(registerUser);
router.route("/register/username").post(checkUsername);

router.route("/login").post(loginUser).get(authUser, getUser);

module.exports = router;
