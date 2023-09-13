const Chats = require("../../models/chats");
const user = require("../../models/user");
const webpush = require("../../webpush");

const handleMsg = async (socket, { msg, reciever, chatId }, addSentMsg) => {
  //GET CHATS OBJECT FIRST
  const chat = await Chats.findById(chatId);
  //CREATE NEW CHAT OBJEXT TO BE INSERTED
  const sent_msg = {
    time: Date.now(),
    msg,
    sender: socket.user.id,
    reciever,
    status: "sent",
  };
  // INSERT NEW CHAT IN CHATS
  await chat.chats.push(sent_msg);
  // SAVE CHATS
  await chat.save();
  // EMIT CHAT RECIEVE
  socket.to(reciever).emit("msg_recieve", {
    recievedMsg: chat.chats[chat.chats.length - 1],
    chatId,
  });
  //EMIT LAST MSG UPDATE
  socket.to(reciever).emit("lastmsg_update", {
    chatID: chatId,
    msg: {
      msg,
      time: Date.now(),
      seen: false,
      sender: socket.user.username,
    },
  });

  await addSentMsg(chat.chats[chat.chats.length - 1]);
  //GET RECIEVER AND SENDER
  const Sender = await user.findById(socket.user.id);
  const Reciever = await user.findOne({ username: reciever });

  //SEND NOTIFICATIONS TO RECIEVER
  Reciever.notiEndpoints.map(async (end) => {
    try {
      const point = JSON.parse(end.point);
      await webpush.sendNotification(
        point,
        JSON.stringify({
          title: Reciever.fullName,
          message: `${socket.user.username} sent you a message`,
        })
      );
    } catch (error) {
      await Reciever.notiEndpoints.id(end._id).deleteOne();
      await Reciever.save();
    }
  });
  Sender.friendsList.find((fr) => fr.chatID === chatId).lastmsg = await {
    msg,
    time: Date.now(),
    seen: false,
    sender: socket.user.username,
  };
  Reciever.friendsList.find((fr) => fr.chatID === chatId).lastmsg = await {
    msg,
    time: Date.now(),
    seen: false,
    sender: socket.user.username,
  };
  Reciever.save();
  Sender.save();
};
module.exports = handleMsg;
