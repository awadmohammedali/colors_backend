import { body } from "express-validator";

export const updateAppConfigValidation = [
  body("androidAppVersion")
    .optional()
    .isString()
    .withMessage("Android app version must be a string")
    .trim()
    .notEmpty()
    .withMessage("Android app version cannot be empty"),
  body("iosAppVersion")
    .optional()
    .isString()
    .withMessage("iOS app version must be a string")
    .trim()
    .notEmpty()
    .withMessage("iOS app version cannot be empty"),
];
