// middlewares/Mediaproject.js
const multer = require('multer');
const path = require('path');

// Define storage configurations
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine the destination based on file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, 'public/media/project/images');
    } else if (file.mimetype.startsWith('video/')) {
      cb(null, 'public/media/project/videos/');
    } else if (file.mimetype.startsWith('application/')) {
      cb(null, 'public/media/project/documents/');
    } else {
      cb(new Error('Unsupported file type'));
    }
  },
  filename: function (req, file, cb) {
    // Use a timestamp and original filename to avoid conflicts
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// allowed file extensions
const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv'];
const documentExtensions = ['.sql', '.pdf', '.docx', '.zip'];
const imageExtensions = ['.png', '.jpg', '.jpeg'];
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.mimetype.startsWith('image/') && imageExtensions.includes(ext)) {
    cb(null, true);
  } else if (file.mimetype.startsWith('video/') && videoExtensions.includes(ext)) {
    cb(null, true);
  } else if (file.mimetype.startsWith('application/') && documentExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported'));
  }
};

// Multer configuration
const projectMedia = multer({
  storage: storage,
  fileFilter: fileFilter
}).array('media', 10); // Accept up to 10 files with the field name 'media'

module.exports = projectMedia;
