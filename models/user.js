const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "please provide username"],
  },
  fullName: {
    type: String,
    required: [true, "please provide your name"],
  },
  dob: {
    type: Date,
    required: [true, "please provide your Birth date"],
  },
  email: {
    type: String,
    required: [true, "please provide email"],
  },
  password: {
    type: String,
    required: [true, "please provide password"],
  },
  profile: {
    type: String,
  },
  recentlySearched: [
    { fullName: String, id: String, profile: String, username: String },
  ],
  friendsList: [
    {
      chatID: String,
      friendUsername: String,
      friendName: String,
      profile: String,
      blocked: {
        type: Boolean,
        default: false,
      },
      lastmsg: {
        msg: {
          type: String,
          default: "",
        },
        time: Number,
        seen: {
          type: Boolean,
          default: false,
        },
        sender: String,
      },
      activity: {
        active: {
          type: Boolean,
          default: false,
        },
        typing: {
          type: Boolean,
          default: false,
        },
        time: Number,
      },
    },
  ],
  requestlist: [
    {
      sender: String,
      sender_pk: String,
      time: String,
      profile: String,
      fullName: String,
      username: String,
      status: String,
    },
  ],
  notiEndpoints: [{ point: String }],
  pendingreq: [
    {
      acceptor: String,
      accecptor_pk: String,
      time: String,
      profile: String,
      fullName: String,
      username: String,
      status: String,
    },
  ],
});

module.exports = mongoose.model("newUser", userSchema);
