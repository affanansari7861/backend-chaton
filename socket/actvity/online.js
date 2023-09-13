const User = require("../../models/user");
const { typing } = require("./typing");

const cameOnline = async (socket) => {
  try {
    console.log(socket.user.username, "came online ");
    const user = await User.findById(socket.user.id);
    if (!user) return;
    user.friendsList.map(async (friend) => {
      socket.to(friend.friendUsername).emit("friend_active", friend.chatID);
      const Friend = await User.findOne({ username: friend.friendUsername });
      Friend.friendsList.find((fr) => fr.chatID === friend.chatID).activity =
        await {
          active: true,
          time: Date.now(),
        };
      await Friend.save();
    });
  } catch (error) {
    console.log("error trigered online");
    // cameOnline(socket);
    console.log(error);
  }
};

const goneOffline = async (socket) => {
  try {
    console.log(socket.user.username, " has gone offline");

    const user = await User.findById(socket.user.id);
    if (!user) return;
    user.friendsList.map(async (friend) => {
      socket
        .to(friend.friendUsername)
        .emit("friend_disconnected", friend.chatID);
      const Friend = await User.findOne({ username: friend.friendUsername });
      Friend.friendsList.find((fr) => fr.chatID === friend.chatID).activity =
        await {
          active: false,
          typing: false,
          time: Date.now(),
        };
      await Friend.save();
    });
  } catch (error) {
    console.log("error trigered offline");
    // goneOffline(socket);
    console.log(error);
  }
};

module.exports = { cameOnline, goneOffline };
