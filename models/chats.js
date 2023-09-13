const mongoose = require("mongoose");

const chatsSchema = new mongoose.Schema({
  chats: [
    {
      time: Number,
      msg: String,
      sender: String,
      reciever: String,
      status: String,
      seen: {
        seen: {
          type: Boolean,
          default: false,
        },
        time: Number,
      },
    },
  ],
});

module.exports = mongoose.model("newChats", chatsSchema);
