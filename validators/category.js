import { body } from "express-validator";

export const createCategoryValidation = [
  body("name").notEmpty().withMessage("Category name is required"),
];

export const updateCategoryValidation = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Category name cannot be empty"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];
