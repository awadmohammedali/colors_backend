import I18n from "i18n";
import { GENERAL_ERROR, USER_DOSE_NOT_EXSIT } from "../util/constants.js";

import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { verifyIdToken } from "apple-signin-auth";
import { expressValidatorHandler } from "../util/helper-functions.js";
//===== GET
const allowUpdates = ["firstName", "lastName"];

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      code: 0,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      const error = new Error(I18n.__(GENERAL_ERROR));
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      code: 0,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyUserData = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error(I18n.__(GENERAL_ERROR));
      error.statusCode = 422;
      throw error;
    }

    res.status(200).json({ code: 0, data: user });
  } catch (err) {
    next(err);
  }
};

//===== POST
export const postSignup = async (req, res, next) => {
  try {
    expressValidatorHandler(validationResult(req));
    const { firstName, lastName, phoneNumber } = req.body;
    const user = User({
      firstName,
      lastName,
      phoneNumber,
    });

    if (!user) {
      const error = new Error(I18n.__(GENERAL_ERROR));
      error.statusCode = 422;
      throw error;
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {});
    await user.save();

    res.status(200).json({ code: 0, data: user, token });
  } catch (err) {
    next(err);
  }
};

export const postAuthGoogle = async (req, res, next) => {
  try {
    const client = new OAuth2Client(process.env.GOOGLE_FIREBASE_CLIENT_ID);
    const idToken = req.query.idToken;
    var user;
    var firstName = "Guest";
    var lastName = "Guest";

    const ticket = await client.verifyIdToken({
      idToken,
      requiredAudience: process.env.GOOGLE_FIREBASE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const sub = payload.sub;

    if (payload.given_name) {
      firstName = payload.given_name;
    }
    if (payload.family_name) {
      lastName = payload.family_name;
    }
    const email = payload.email;
    user = await User.findOne({ sub });

    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        // expiresIn: "24h",
      });

      return res.status(200).json({ code: 0, data: user, token });
    }

    user = await User.create({
      firstName,
      lastName,
      phoneNumber: Math.floor(Math.random() * 10000000),
      email,
      sub,
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {});
    res.status(200).json({ code: 0, data: user, token });
  } catch (err) {
    next(err);
  }
};

export const postAuthApple = async (req, res, next) => {
  try {
    var user;
    var firstName = "Guest";
    var lastName = "Guest";
    var user;
    const identityToken = req.query.identityToken;
    // const authorizationCode=req.query.authorizationCode

    if (req.query.firstName) {
      firstName = req.query.firstName;
    }
    if (req.query.lastName) {
      lastName = req.query.lastName;
    }
    const email = req.query.email;
    const auth = await verifyIdToken(identityToken);

    if (!auth) {
      const error = new Error(I18n.__(GENERAL_ERROR));
      error.statusCode = 422;
      throw error;
    }
    const sub = auth.sub;

    user = await User.findOne({ sub });

    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        // expiresIn: "24h",
      });
      user.phoneNumber = "";

      return res.status(200).json({ code: 0, data: user, token });
    }

    user = await User.create({
      firstName,
      lastName,
      phoneNumber: Math.floor(Math.random() * 10000000),
      email,
      sub,
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {});
    res.status(200).json({ code: 0, data: user, token });
  } catch (err) {
    next(err);
  }
};

export const postLogin = async (req, res, next) => {
  try {
    expressValidatorHandler(validationResult(req));

    const user = await User.findOne({ phoneNumber: req.body.phoneNumber });

    if (!user) {
      const error = new Error(I18n.__(USER_DOSE_NOT_EXSIT));
      error.statusCode = 404;
      throw error;
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      // expiresIn: "24h",
    });

    res.status(200).json({ code: 0, data: user, token });
  } catch (err) {
    next(err);
  }
};
//===== PUT

// export const putUpdateMyUserData = async (req, res, next) => {
//   try {
//     expressValidatorHandler(validationResult(req));

//     var deletedImageName;
//     const user = await User.findById(req.userId);

//     if (!user) {
//       const error = new Error(I18n.__(GENERAL_ERROR));
//       error.statusCode = 422;
//       throw error;
//     }

//     allowUpdates.forEach((key) => {
//       if (req.body[key]) {
//         user[key] = req.body[key];
//       }
//     });

//     if (req.file) {
//       var name;
//       if (
//         user.image &&
//         !user.image.includes("google") &&
//         !user.image.includes("apple")
//       ) {
//         var oldImageExtensionArray = user.image.trim().split(".");
//         const oldImageExtension =
//           oldImageExtensionArray[oldImageExtensionArray.length - 1];

//         var newImageExtensionArray = req.file.originalname.trim().split(".");
//         const newImageExtenstion =
//           newImageExtensionArray[newImageExtensionArray.length - 1];

//         if (oldImageExtension != newImageExtenstion) {
//           name = user.image;
//         } else {
//           deletedImageName = user.image;
//           name = getUniqueName(req.file.originalname);
//           user.image = name;
//         }
//       } else {
//         name = getUniqueName(req.file.originalname);
//         user.image = name;
//       }
//       await uploadImageToAW3(req.file, name);
//     }
//     await user.save();
//     user.image = await getMediaUrl(user.image);
//     if (deletedImageName) {
//       deleteImageFromAW3(deletedImageName);
//     }
//     res.status(200).json({ code: 0, data: user });
//   } catch (err) {
//     next(err);
//   }
// };

// export const putUpdateUser = async (req, res, next) => {
//   try {
//     expressValidatorHandler(validationResult(req));

//     const user = await User.findById(req.params.id);

//     if (!user) {
//       const error = new Error(I18n.__(GENERAL_ERROR));
//       error.statusCode = 422;
//       throw error;
//     }

//     allowUpdates.forEach((key) => {
//       if (req.body[key]) {
//         user[key] = req.body[key];
//       }
//     });

//     if (req.file) {
//       if (
//         user.image &&
//         !user.image.includes("google") &&
//         !user.image.includes("apple")
//       ) {
//         await uploadImageToAW3(req.file, user.image);
//       } else {
//         const name = getUniqueName(req.file.originalname);
//         user.image = name;
//         await uploadImageToAW3(req.file, name);
//       }
//     }
//     await user.save();
//     user.image = await getMediaUrl(user.image);

//     res.status(200).json({ code: 0, data: user });
//   } catch (err) {
//     next(err);
//   }
// };

//===== DELETE
export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.userId; // Make sure this is a valid ObjectId string

    const user = await User.findOneAndDelete({ _id: userId });
    if (!user) {
      const error = new Error(I18n.__(GENERAL_ERROR));
      error.statusCode = 422;
      throw error;
    }
    res.status(200).json({ code: 0, data: user });
  } catch (err) {
    next(err);
  }
};
