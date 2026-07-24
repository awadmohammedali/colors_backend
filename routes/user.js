import express from "express";
import {
  getMyUserData,
  getUserDetails,
  postAuthApple,
  postAuthGoogle,
  postLogin,
  postSignup,
  postNewUserCategoryPurchase,
  putUpdateMyUserData,
  putUpdateUser,
  PostserPurchseCoins,
  postStoreFCMToken,
  postAuthFacebook,
  deleteUser,
} from "../controllers/user.js";
import isAuth from "../middlewares/is-auth.js";
import { body } from "express-validator";
import {
  INVALID_PHONE_NUMBER,
  REQUIRED_FIELDS,
  testPhoneNumber,
} from "../util/constants.js";
import I18n from "i18n";
import multerHelper from "../middlewares/multer-helper.js";
const router = express.Router();

//----- POST
router.post(
  "/signup",
  multerHelper("profileImage", "data/images/profile"),
  [
    body("firstName", () => {
      return I18n.__(REQUIRED_FIELDS);
    }).notEmpty(),
    body("lastName", () => {
      return I18n.__(REQUIRED_FIELDS);
    }).notEmpty(),
    body("phoneNumber", () => {
      return I18n.__(INVALID_PHONE_NUMBER);
    })
      .notEmpty()
      .isNumeric()
      .isLength({ min: 12, max: 12 })
      .custom((value) => {
        if (value[3] !== "5" && value !== testPhoneNumber) {
          throw new Error(I18n.__(INVALID_PHONE_NUMBER));
        }
        return true;
      }),
  ],
  postSignup,
);

router.post("/user/me/category/purchase", isAuth, postNewUserCategoryPurchase);

router.post("/user/me/coins/purchase", isAuth, PostserPurchseCoins);

router.post("/auth/google", postAuthGoogle);

router.post("/auth/facebook", postAuthFacebook);

router.post("/auth/apple", postAuthApple);

router.post("/user/me/fcm_token", postStoreFCMToken);

router.post(
  "/login",
  body("phoneNumber", () => {
    return I18n.__(INVALID_PHONE_NUMBER);
  })
    .notEmpty()
    .isNumeric()
    .isLength({ min: 12, max: 12 })
    .custom((value) => {
      if (value[3] !== "5" && value !== testPhoneNumber) {
        throw new Error(I18n.__(INVALID_PHONE_NUMBER));
      }
      return true;
    }),
  postLogin,
);

// router.post("/user/:id/otp/verify", postOTPVerification);

//----- GET

router.get("/user/me", isAuth, getMyUserData);

router.get("/user/:id", isAuth, getUserDetails);
//----- PUT
router.put(
  "/user/me",
  multerHelper("profileImage", "data/images/profile"),
  isAuth,
  putUpdateMyUserData,
);
router.put(
  "/user/:id",
  multerHelper("profileImage", "data/images/profile"),
  isAuth,
  putUpdateUser,
);

//----- DELETE

router.delete("/user", isAuth, deleteUser);

export default router;
