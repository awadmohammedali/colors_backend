import { body, param } from "express-validator";

export const leaderboardIdValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid Leaderboard ID"),
];

export const createLeaderboardValidation = [
  body("name")
    .notEmpty()
    .withMessage("Leaderboard name is required"),
];

export const updateLeaderboardValidation = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Leaderboard name cannot be empty"),
];
