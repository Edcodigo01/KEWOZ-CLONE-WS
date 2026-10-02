let multer = require("multer");
let mime = require("mime-types");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = "";
    switch (req.body.pictureType) {
      case "profile_pic":
        uploadPath = "./uploads/profile_pic";
        break;
      case "banner_image":
        uploadPath = "./uploads/banner_image";
        break;
      case "gif":
        uploadPath = "./uploads/gif";
        break;
      case "doc":
        uploadPath = "./uploads/doc";
        break;
      case "chat_image":
        uploadPath = "./uploads/wallpaper";
        break;
      case "chat_video":
        uploadPath = "./uploads/wallpaper";
        break;
      case "wallpaper":
        uploadPath = "./uploads/wallpaper";
        break;
      case "story_image":
        uploadPath = "./uploads/story";
        break;
      case "story_video":
        uploadPath = "./uploads/story";
        break;
      case "avatar":
        uploadPath = "./uploads/avatars";
        break;
      case "group_icon":
        uploadPath = "./uploads/group_icons";
        break;
      case "catalog_images":
        uploadPath = "./uploads/catalog_images";
        break;
      case "splash_image":
        uploadPath = "./uploads/splash";
        break;
      case "splash_image_mobile":
        uploadPath = "./uploads/splash";
        break;
      case "mass_message_image":
        uploadPath = "./uploads/mass_messages";
        break;
      default:
        if (req.url.includes("users/updateUser")) {
          uploadPath = "./uploads/profile";
        } else {
          uploadPath = "./uploads/others";
        }
    }

    // Check if directory exists, create it if it doesn't
    fs.exists(uploadPath, (exists) => {
      if (!exists) {
        fs.mkdir(uploadPath, { recursive: true }, (err) => {
          if (err) {
            return cb(err);
          }
          cb(null, uploadPath);
        });
      } else {
        cb(null, uploadPath);
      }
    });
  },

  filename: function (req, file, cb) {
    return cb(
      null,
      `${Date.now()}-${file.originalname
        .replaceAll("#", "-")
        .replaceAll(" ", "-")}`
    );
  },
});

const upload = multer({ storage });

module.exports = upload;
