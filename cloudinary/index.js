const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.UPLOAD_NAME,
  api_key: process.env.UPLOAD_KEY,
  api_secret: process.env.UPLOAD_SECRET,
});
module.exports = cloudinary;
