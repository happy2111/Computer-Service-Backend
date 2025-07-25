const multer = require('multer');
const path = require('path');
const fs = require('fs');

const folderPath = 'uploads/masters/avatars';

if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, {recursive: true});
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
})

const upload = multer({storage})
module.exports = upload;