import { body } from "express-validator";

export const createUserValidation = [
  body("firstName").notEmpty().withMessage("First name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
];

export const updateUserValidation = [
  body("firstName")
    .optional()
    .notEmpty()
    .withMessage("First name cannot be empty"),

  body("lastName")
    .optional()
    .isString()
    .withMessage("Last name must be a string"),

  body("email").optional().isEmail().withMessage("Valid email is required"),

  body("isPremium")
    .optional()
    .isBoolean()
    .withMessage("isPremium must be a boolean"),

  body("isBlocked")
    .optional()
    .isBoolean()
    .withMessage("isBlocked must be a boolean"),

  body("coins").optional().isNumeric().withMessage("Coins must be a number"),
];
