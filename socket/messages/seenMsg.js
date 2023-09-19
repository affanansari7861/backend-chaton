const Chats = require("../../models/chats");
const seenMsg = async (socket, index, chatID, friendUsename, callback) => {
  try {
    console.log(index);
    const chat = await Chats.findById(chatID);
    console.log(friendUsename);
    chat.chats[index].seen = await {
      seen: true,
      time: Date.now(),
    };
    await chat.save();
    socket.to(friendUsename).emit("msg_seen", { index, chatID });

    callback({ index, chatID });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { seenMsg };
