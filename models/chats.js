const mongoose = require("mongoose");

const chatsSchema = new mongoose.Schema({
  chats: [
    {
      time: String,
      msg: String,
      sender: String,
      reciever: String,
      status: String,
    },
  ],
});

module.exports = mongoose.model("Chats", chatsSchema);
