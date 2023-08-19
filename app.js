// NPM IMPORTS
require("dotenv").config();
require("express-async-errors");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

// LOCAL IMPORTS
const connectDB = require("./db/connect");
const userRouter = require("./routes/user");
const friendsRouter = require("./routes/friends");

// MIDDLEWARE IMPORTS
const notFound = require("./middlewares/not-found");
const errorHandler = require("./middlewares/error-handler");

const app = express();
const server = require("http").createServer(app);
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.static("./public"));

// socket setup
const connectSocket = require("./socket/index");
connectSocket(server);

// routes
app.use("/user", userRouter);
app.use("/friends", friendsRouter);
app.use(morgan("dev"));
app.use(errorHandler);
app.use(notFound);
const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(port, console.log(`server is listening at port ${port} ...`));
  } catch (error) {
    console.log(error);
  }
};

start();
