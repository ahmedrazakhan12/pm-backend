// middlewares/Multer.js
const multer = require("multer");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/pfp/"); // Destination folder for uploads
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Use timestamp and original filename for storing
  }
});

// Multer file filter configuration (optional)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("File type not supported"));
  }
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
}).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 }
]);

module.exports = upload;

module.exports = upload;
