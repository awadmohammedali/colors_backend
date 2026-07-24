import { body } from "express-validator";

export const createColorValidation = [
  body("code")
    .notEmpty()
    .withMessage("Color code is required")
    .isString()
    .withMessage("Color code must be a string"),
  body("icon").optional().isString().withMessage("Icon must be a string"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  body("order").optional().isNumeric().withMessage("Order must be a number"),
  body("variants")
    .optional()
    .isArray()
    .withMessage("Variants must be an array"),
  body("variants.*")
    .optional()
    .isMongoId()
    .withMessage("Invalid game variant ID"),
];

export const updateColorValidation = [
  body("code")
    .optional()
    .notEmpty()
    .withMessage("Color code cannot be empty")
    .isString()
    .withMessage("Color code must be a string"),
  body("icon").optional().isString().withMessage("Icon must be a string"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  body("order").optional().isNumeric().withMessage("Order must be a number"),
  body("variants")
    .optional()
    .isArray()
    .withMessage("Variants must be an array"),
  body("variants.*")
    .optional()
    .isMongoId()
    .withMessage("Invalid game variant ID"),
];
