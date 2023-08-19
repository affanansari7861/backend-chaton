const jwt = require("jsonwebtoken");
const { UnAuthenticatedError } = require("../errors/custom-error");

const authUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnAuthenticatedError("session expired please login ");
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = { ...decoded, token };
    next();
  } catch (error) {
    console.log("unauthenticated");
    throw new UnAuthenticatedError("session expired please login again");
  }
};

module.exports = authUser;
