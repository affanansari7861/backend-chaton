const User = require("../../models/user");

const cameOnline = async (socket) => {
  console.log(socket.user.username, "came online ");
  const user = await User.findById(socket.user.id);
  user.friendsList.map(async (friend) => {
    console.log(friend._id);
    const Friend = await User.findOne({ username: friend.friendUsername });
    const alreadyActive = await Friend.activeList.find(
      (activeUser) => activeUser.username === user.username
    );
    if (alreadyActive) return;
    const { username, profile, fullName } = user;
    await Friend.activeList.push({ username, profile, id: friend._id });
    await Friend.save();
  });
};

const goneOffline = async (socket) => {
  console.log(socket.user.username, " has gone offline");
  const user = await User.findById(socket.user.id);
  user.friendsList.map(async (friend) => {
    const Friend = await User.findOne({ username: friend.friendUsername });
    Friend.activeList = await Friend.activeList.filter(
      (activeUser) => activeUser.username !== user.username
    );
    await Friend.save();
  });
};

module.exports = { cameOnline, goneOffline };