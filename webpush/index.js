const webpush = require("web-push");
const vapidKeys = webpush.generateVAPIDKeys();

//CONFIGURE WEBPUSH DETAILS
webpush.setVapidDetails(
  "mailto:arslaan786ansari@gmail.com",
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);
module.exports = webpush;
