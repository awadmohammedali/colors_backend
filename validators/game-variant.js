import { body } from "express-validator";

export const createGameVariantValidation = [
  body("name")
    .notEmpty()
    .withMessage("Game variant name is required")
    .isObject()
    .withMessage("Game variant name must be an object"),
  body("instruction")
    .optional()
    .isObject()
    .withMessage("Instructions must be an object"),
  body("icon").optional().isString().withMessage("Icon must be a string"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  body("timer").optional().isNumeric().withMessage("Timer must be a number"),
];

export const updateGameVariantValidation = [
  body("name")
    .optional()
    .isObject()
    .withMessage("Game variant name must be an object"),
  body("instruction")
    .optional()
    .isObject()
    .withMessage("Instructions must be an object"),
  body("icon").optional().isString().withMessage("Icon must be a string"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  body("timer").optional().isNumeric().withMessage("Timer must be a number"),
];
