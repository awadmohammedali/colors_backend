import multer from "multer";
// import path from "path";
const storage = multer.memoryStorage()
// const upload = multer({ storage: storage })

const allowedMimes = [
  "video/mp4",
  "audio/mp3",
  "audio/mpeg",
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export default (name, destination, prefix = "") => {
  return new multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
  }).single(name);
};

// multer.diskStorage({
//   destination: function (req, file, cb) {
//     // Set destination for group images
//     cb(null, destination);
//   },
//   filename: function (req, file, cb) {
//     // Set filename as you need
//     const fileExtension = path.extname(file.originalname);
//     if (fileExtension == ".mp3") {
//       cb(null, file.originalname);
//     } else {
//       if (destination.includes("profile")) {
//         return cb(null, +Date.now() + "_profile_image" + fileExtension);
//       }
//       cb(null, prefix + Date.now() + fileExtension);
//     }
//   },
// }),