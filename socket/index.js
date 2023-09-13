const { cameOnline, goneOffline } = require("./actvity/online");
const { typing, stopedTyping } = require("./actvity/typing");
const authenticate = require("./auth");
const handleMsg = require("./messages/handleMsg");
const { handleFriendReq, acceptedReq } = require("./requests/handleReq");
const connectSocket = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://192.168.1.6:3000",
        "https://chat-onn.netlify.app",
      ],
    },
  });

  io.on("connection", async (socket) => {
    const user_room = socket.user.username;
    if (user_room) await socket.join(user_room);
    cameOnline(socket);
    socket.emit("join_room", user_room);
    socket.on("send_request", (payload, addpend) => {
      handleFriendReq(socket, payload, addpend);
    });
    socket.on("accept_request", (payload, removeReq) => {
      console.log("request accepted");
      acceptedReq(socket, payload, removeReq);
    });
    socket.on("disconnect", async (reason) => {
      goneOffline(socket);
    });
    socket.on("send_msg", (payload, addSentMsg) => {
      handleMsg(socket, payload, addSentMsg);
    });
    socket.on("typing", (chatID, fr_username, value) => {
      typing(socket, chatID, fr_username, value);
    });
  });

  // authenticate
  io.use(authenticate);
};

module.exports = connectSocket;
