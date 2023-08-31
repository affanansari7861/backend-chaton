const Chats = require("../../models/chats");
const User = require("../../models/user");
const webpush = require("../../webpush");

//FOR REQUEST RECIEVE
const handleFriendReq = async (
  socket,
  { sender, acceptor, sender_pk },
  addpend
) => {
  try {
    // get acceptor data
    const Acceptor = await User.findById(acceptor);
    socket.emit("test", "test passed");
    if (!Acceptor) return console.log("no user with such id", acceptor);
    // check if request already present
    const alreadyRecieved = await Acceptor.requestlist.some(
      (req) => req.sender === sender
    );

    // return if request already sent
    if (alreadyRecieved) return console.log("already sent");

    // get sender data
    const Sender = await User.findById(sender);
    if (!Sender) {
      console.log("no user with such id", sender);
    }

    // create a request object
    const req = {
      sender,
      sender_pk,
      time: new Date().toLocaleTimeString(),
      profile: Sender.profile,
      fullName: Sender.fullName,
      username: Sender.username,
      status: "pending",
    };
    // create object for pending req
    const pendreq = {
      status: "pending",
      username: Acceptor.username,
      fullName: Acceptor.fullName,
      acceptor,
      time: new Date().toLocaleTimeString(),
      profile: Acceptor.profile,
    };

    // add request to acceptor requestlist
    await Acceptor.requestlist.push(req);
    await Acceptor.save();

    // check if req already present in pending request
    const alreadySent = await Sender.pendingreq.some(
      (req) => req.acceptor === acceptor
    );
    // if not already present save in senders pending request list
    if (!alreadySent) {
      await Sender.pendingreq.push(pendreq);
      await Sender.save();
    }

    // emit request to acceptor in real time opo
    socket.to(Acceptor.username).emit(
      "req_recieve",
      Acceptor.requestlist.find((req) => req.sender === sender)
    );

    // call callback function recieved from sender
    addpend(Sender.pendingreq.find((req) => req.acceptor === acceptor));
    //send a request to the acceptor for incoming friend request
    Acceptor.notiEndpoints.forEach(async (end) => {
      try {
        const point = JSON.parse(end.point);
        webpush.sendNotification(
          point,
          JSON.stringify({
            title: Acceptor.fullName,
            message: `${Sender.username} sent you a friend request`,
          })
        );
      } catch (error) {
        Acceptor.notiEndpoints.filter((point) => point !== end);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
// FOR REQUEST ACCEPTANCE
const acceptedReq = async (
  socket,
  { sender, acceptor, acceptor_pk, requestId },
  removeReq
) => {
  try {
    // GET SENDER AND ACCEPTOR
    const Sender = await User.findById(sender);
    const Acceptor = await User.findById(acceptor);

    // GET THE PENDING REQ FROM SENDER
    const pendreq = await Sender.pendingreq.find((req) => {
      return req.acceptor === acceptor;
    });

    // Set ACCEPTOR PUBLIC KEY AND STATUS
    pendreq.accecptor_pk = acceptor_pk;
    pendreq.status = "accepted";

    // CREATE A CHAT OBJECT
    const chat = await Chats.create({ chats: [] });

    // // SAVE FRIEND IN SENDER FRIENDLIST DB
    await Sender.friendsList.push({
      chatID: chat._id,
      friendName: Acceptor.fullName,
      friendUsername: Acceptor.username,
      profile: Acceptor.profile,
    });

    // SAVE FRIEND IN ACCEPTOR FRIENDLIST DB
    await Acceptor.friendsList.push({
      chatID: chat._id,
      friendName: Sender.fullName,
      friendUsername: Sender.username,
      profile: Sender.profile,
    });

    // DELETE REQUEST DB
    const request = await Acceptor.requestlist.id(requestId);
    request.deleteOne();
    //Delete pending req from sender db
    await Sender.pendingreq.id(pendreq._id).deleteOne();

    //SAVE ACCEPTOR AND SENDER
    await Acceptor.save();
    await Sender.save();

    // CREATE FRIEND OBJECTS FOR BOTH SEDNER ACCEPTOR
    const friend_sender = await Sender.friendsList.find(
      (friend) => friend.friendUsername === Acceptor.username
    );
    const friend_acceptor = await Acceptor.friendsList.find(
      (friend) => friend.friendUsername === Sender.username
    );
    // ADD FRIEND AND REMOVE REQUEST FROM BOTH SENDER AND ACCEPTOR
    removeReq(requestId, friend_acceptor);
    socket.to(Sender.username).emit("req_accepted", pendreq._id, friend_sender);
    //Send a notification to sender of request accepted
    Sender.notiEndpoints.forEach(async (end) => {
      try {
        const point = JSON.parse(end.point);
        webpush.sendNotification(
          point,
          JSON.stringify({
            title: Sender.fullName,
            message: `${Acceptor.username} accepted your friend request`,
          })
        );
      } catch (error) {
        Sender.notiEndpoints.filter((point) => point !== end);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
module.exports = { handleFriendReq, acceptedReq };
