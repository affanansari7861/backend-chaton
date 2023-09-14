const {
  BadRequestError,
  UnAuthenticatedError,
  CustomApiError,
} = require("../errors/custom-error");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const webpush = require("../webpush");
const cloudinary = require("../cloudinary");
const user = require("../models/user");
const Chats = require("../models/chats");

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
  const user = await User.create({
    ...req.body,
    requestlist: [],
    password,
    notiEndpoints: [],
    activeList: [],
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
    activeList,
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
      activeList,
    },
    token,
  });
};
// login route
const loginUser = async (req, res) => {
  // await User.deleteMany({});
  console.log("logging");
  const user = await User.findOne({ username: req.body.username });
  // CHECK FOR ANY MONGOSSE ERROR
  if (!user) {
    throw new UnAuthenticatedError(
      "no user with username:" + req.body.username
    );
  }

  const ispassCorrect = await bcrypt.compare(req.body.password, user.password);
  if (!ispassCorrect) throw new UnAuthenticatedError("password incorrect");
  // CREATE A TOKEN
  const payload = { username: user.username, id: user._id };
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  // CHECK IF USER ALLOWED NOTIFCATION
  if (req.body.notiEndpoint) {
    const endPoint = user.notiEndpoints.find(
      (point) => point.point === req.body.notiEndpoint
    );
    if (!endPoint) {
      await user.notiEndpoints.push({ point: req.body.notiEndpoint });
      await user.save();
    }
  }
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
    activeList,
    pendingreq,
  } = user;
  // SEND BACK USER OBJECT
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
      activeList,
    },
    token,
  });
};

const getUser = async (req, res) => {
  const users = await User.find({});
  // users.map(async (client) => {
  //   await delete client.activeList;
  //   await delete client.friendsList.lastActivity;
  //   await client.save();
  //   console.log("deleted");
  // });
  const { username, id, token } = req.user;
  const user = await User.findById(id);
  if (!user) {
    throw new UnAuthenticatedError("session expired please login again");
  }
  user.notiEndpoints.map(async (end) => {
    try {
      const point = JSON.parse(end.point);
      await webpush.sendNotification(
        point,
        JSON.stringify({
          title: `hello ${username}`,
          message: "you have succefully logged in",
        })
      );
    } catch (error) {
      await user.notiEndpoints.id(end._id).deleteOne();
      await user.save();
    }
  });

  const {
    dob,
    friendsList,
    fullName,
    email,
    profile,
    recentlySearched,
    requestlist,
    pendingreq,
    activeList,
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
      activeList,
    },
    token,
  });
};
const updateuser = async (req, res) => {
  const profile_img = req.body.profile;
  // check if profile is changed
  if (profile_img && !profile_img.startsWith('{"public_id"')) {
    const res_img = await cloudinary.uploader.upload(profile_img, {
      upload_preset: "chaton",
    });
    if (!res_img) throw BadRequestError("please upload a valid image");
    const { public_id, secure_url } = res_img;
    req.body.profile = await JSON.stringify({ public_id, secure_url });
  }
  // update user
  const updatedUser = await User.findById(req.user.id);
  if (updatedUser.profile) {
    const oldProfile = JSON.parse(updatedUser.profile);
    if (oldProfile) await cloudinary.uploader.destroy(oldProfile.public_id);
  }

  updatedUser.username = await req.body.username;
  updatedUser.fullName = await req.body.fullName;
  updatedUser.dob = await req.body.dob;
  updatedUser.profile = await req.body.profile;
  await updatedUser.save();

  // CREATE A TOKEN
  const payload = { username: updatedUser.username, id: updatedUser._id };
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  // create updated user obj for client

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
    activeList,
  } = updatedUser;

  // update info in all friends friends list
  updatedUser.friendsList.map(async (friend) => {
    const Friend = await User.findOne({ username: friend.friendUsername });
    const friendObj = await Friend.friendsList.find(
      (user) => user.chatID === friend.chatID
    );
    friendObj.friendName = fullName;
    friendObj.friendUsername = username;
    friendObj.profile = profile;
    await Friend.save();
  });
  // send back updated user back to client
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
      activeList,
      pendingreq,
    },
    token,
  });
};

module.exports = { registerUser, loginUser, getUser, updateuser };
