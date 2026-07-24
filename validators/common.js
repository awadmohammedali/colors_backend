import { param } from "express-validator";

export const mongoIdValidation = [
  param("id").isMongoId().withMessage("Invalid ID"),
];
