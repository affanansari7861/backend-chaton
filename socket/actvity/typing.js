const User = require("../../models/user");

const typing = async (socket, chatID, fr_username, value) => {
  const Friend = await User.findOne({ username: fr_username });
  socket.to(fr_username).emit("typing", chatID, fr_username, value);
  Friend.friendsList.find(
    (friend) => friend.chatID === chatID
  ).activity.typing = value;
  await Friend.save();
};

module.exports = { typing };
