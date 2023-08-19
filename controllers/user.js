const {
  BadRequestError,
  UnAuthenticatedError,
} = require("../errors/custom-error");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const webpush = require("../webpush");
const cloudinary = require("../cloudinary");

// regiter route
const registerUser = async (req, res) => {
  const profile_img = req.body.profile;
  if (profile_img) {
    const res_img = await cloudinary.uploader.upload(profile_img, {
      upload_preset: "chaton",
    });
    if (!res_img) throw BadRequestError("please upload a valid image");
    const { public_id, secure_url } = res_img;
    req.body.profile = JSON.stringify({ public_id, secure_url });
  }

  // HASH PAASWORD
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt);
  // console.log(req.body);
  const user = await User.create({
    ...req.body,
    requestlist: [],
    password,
    notiEndpoints: [],
  });

  if (!user) throw new BadRequestError("please provide all credentials");
  // CHECK IF USER ALLOWED NOTIFCATION
  if (req.body.notiEndpoint) {
    await user.notiEndpoints.push({ point: req.body.notiEndpoint });
    await user.save();
    const endPoint = JSON.parse(req.body.notiEndpoint);
    // console.log(endPoint);
  }
  // PAYLOAD FOR TOKEN
  const payload = { username: user.username, id: user._id };
  const {
    _id,
    dob,
    username,
    friendsList,
    fullName,
    email,
    profile,
    recentlySearched,
    requestlist,
    pendingreq,
  } = user;
  // CREATE TOKEN
  const token = await jwt.sign(payload, process.env.JWT_SECRET);
  // SEND USER OBJET BACK TO CLIENT
  res.status(201).json({
    user: {
      _id,
      dob,
      username,
      friendsList,
      fullName,
      email,
      profile,
      recentlySearched,
      requestlist,
      pendingreq,
    },
    token,
  });
};
// login route
const loginUser = async (req, res) => {
  // await User.deleteMany({});
  const user = await User.findOne({ username: req.body.username });
  if (!user) {
    throw new UnAuthenticatedError(
      "no user with username:" + req.body.username
    );
  }

  const ispassCorrect = await bcrypt.compare(req.body.password, user.password);
  if (!ispassCorrect) throw new UnAuthenticatedError("password incorrect");
  const payload = { username: user.username, id: user._id };
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  const {
    _id,
    dob,
    username,
    friendsList,
    fullName,
    email,
    profile,
    recentlySearched,
    requestlist,
    pendingreq,
  } = user;
  res.status(201).json({
    user: {
      _id,
      dob,
      username,
      friendsList,
      fullName,
      email,
      profile,
      recentlySearched,
      requestlist,
      pendingreq,
    },
    token,
  });
};
const checkUsername = async (req, res) => {
  console.log(req.body);
  const user = await User.findOne(req.body);
  if (user) {
    throw BadRequestError("username not avaiable");
  }
  res.status(200).json({ available: true });
};

const getUser = async (req, res) => {
  const { username, id, token } = req.user;
  const user = await User.findById(id);
  const end = JSON.parse(user.notiEndpoints[0].point);
  setTimeout(() => {
    webpush.sendNotification(
      end,
      JSON.stringify({
        title: "hello arslaan",
        message: "you have succefully logged in",
      })
    );
    console.log("sent");
  }, 10000);
  const {
    dob,
    friendsList,
    fullName,
    email,
    profile,
    recentlySearched,
    requestlist,
    pendingreq,
  } = user;
  res.status(200).json({
    user: {
      _id: id,
      dob,
      username,
      friendsList,
      fullName,
      email,
      profile,
      recentlySearched,
      requestlist,
      pendingreq,
    },
    token,
  });
};

module.exports = { registerUser, loginUser, checkUsername, getUser };