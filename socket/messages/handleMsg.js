const Chats = require("../../models/chats");
const user = require("../../models/user");
const webpush = require("../../webpush");

const handleMsg = async (socket, { msg, reciever, chatId }, addSentMsg) => {
  //GET CHATS OBJECT FIRST
  const chat = await Chats.findById(chatId);
  //GET RECIEVER
  const Reciever = await user.findOne({ username: reciever });
  //CREATE NEW CHAT OBJEXT TO BE INSERTED
  const sent_msg = {
    time: new Date().toLocaleTimeString(),
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
  await addSentMsg(chat.chats[chat.chats.length - 1]);
  socket.to(reciever).emit("msg_recieve", {
    recievedMsg: chat.chats[chat.chats.length - 1],
    chatId,
  });
  Reciever.notiEndpoints.forEach((end) => {
    const point = JSON.parse(end.point);
    webpush.sendNotification(
      point,
      JSON.stringify({
        title: Reciever.fullName,
        message: `${socket.user.username} sent you a message`,
      })
    );
  });
};
module.exports = handleMsg;
