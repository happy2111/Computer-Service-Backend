const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Dynamic destination logic
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = "uploads/";

    if (file.fieldname === "deviceFiles") {
      if (file.mimetype.startsWith("image/")) {
        folder = "uploads/devices/images/";
      } else if (file.mimetype.startsWith("video/")) {
        folder = "uploads/devices/videos/";
      } else {
        return cb(new Error("Unsupported file type"), false);
      }
    }

    fs.mkdirSync(folder, { recursive: true }); // Создаём папку, если нет
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = function (req, file, cb) {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm", "video/quicktime"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });
module.exports = upload;
