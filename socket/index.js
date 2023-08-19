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

  io.on("connection", (socket) => {
    const user_room = socket.user.username;
    console.log("room", user_room);
    if (user_room) socket.join(user_room);
    socket.emit("join_room", user_room);
    socket.on("send_request", (payload, addpend) => {
      handleFriendReq(socket, payload, addpend);
    });
    socket.on("accept_request", (payload, removeReq) => {
      // "accept_request", payload;
      console.log("request accepted");
      acceptedReq(socket, payload, removeReq);
    });
    socket.on("send_msg", (payload, addSentMsg) => {
      handleMsg(socket, payload, addSentMsg);
    });
  });

  // authenticate
  io.use(authenticate);
};

module.exports = connectSocket;
