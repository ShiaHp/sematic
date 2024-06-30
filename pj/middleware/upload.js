// const util = require("util");
// const multer = require("multer");
// const { GridFsStorage } = require("multer-gridfs-storage");
// const dbConfig = require("../config/db");

// const storage = new GridFsStorage({
//   url: dbConfig.url + dbConfig.database,
//   options: { useNewUrlParser: true, useUnifiedTopology: true },
//   file: (req, file) => {
//     const match = ["image/png", "image/jpeg"];

//     if (match.indexOf(file.mimetype) === -1) {
//       const filename = `${Date.now()}-bezkoder-${file.originalname}`;
//       return filename;
//     }

//     return {
//       bucketName: dbConfig.imgBucket,
//       filename: `${Date.now()}-bezkoder-${file.originalname}`,
//     };
//   },
// });

// const uploadFiles = multer({ storage: storage }).single("file");
// const uploadFilesMiddleware = util.promisify(uploadFiles);
// module.exports = uploadFilesMiddleware;

const multer = require("multer");

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Create the multer instance
const upload = multer({ storage: storage });

module.exports = upload;
