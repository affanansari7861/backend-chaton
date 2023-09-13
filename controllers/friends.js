const { NotFoundError } = require("../errors/custom-error");
const User = require("../models/user");
const Chats = require("../models/chats");
const chats = require("../models/chats");
const getChats = async (req, res) => {
  const chatID = req.params.chatId;
  const chat = await Chats.findById(chatID);
  res.status(200).json(chat);
};

const searchUser = async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) throw new NotFoundError("no user found with this username");
  const add = await User.updateOne(
    { username: req.user.username },
    { $addToSet: { recentlySearched: user } }
  );
  const { username, fullName, _id, profile } = user;
  res.status(200).json({ username, fullName, _id, profile });
};

module.exports = { getChats, searchUser };
