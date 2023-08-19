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

module.exports = mongoose.model("User", userSchema);
