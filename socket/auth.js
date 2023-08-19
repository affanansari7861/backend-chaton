const jwt = require("jsonwebtoken");
const auth = async (socket, next) => {
  try {
    const authHeader = socket.handshake.auth.token;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      console.log("token not provided");
      next(new Error("session expired please login again"));
    }
    const token = authHeader.split(" ")[1];
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    // console.log(token, "decoded");
    socket.user = { ...decoded };
    // console.log(decoded);
    next();
  } catch (error) {
    console.log("rejected");
    next(new Error("session expired please login again"));
  }
};

module.exports = auth;
