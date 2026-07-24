import express from "express";

import isAdminAuth from "../middlewares/is-admin-auth.js";

import {
  getLeaderboards,
  getLeaderboardDetails,
  postLeaderboard,
  putLeaderboard,
  deleteLeaderboard,
} from "../controllers/leaderboard-controller.js";

import {
  leaderboardIdValidation,
  createLeaderboardValidation,
  updateLeaderboardValidation,
} from "../validations/leaderboard-validator.js";

const router = express.Router();

router.post(
  "/admin/leaderboards",
  isAdminAuth,
  createLeaderboardValidation,
  postLeaderboard,
);

router.get(
  "/admin/leaderboards",
  isAdminAuth,
  getLeaderboards,
);

router.get(
  "/admin/leaderboards/:id",
  isAdminAuth,
  leaderboardIdValidation,
  getLeaderboardDetails,
);

router.put(
  "/admin/leaderboards/:id",
  isAdminAuth,
  leaderboardIdValidation,
  updateLeaderboardValidation,
  putLeaderboard,
);

router.delete(
  "/admin/leaderboards/:id",
  isAdminAuth,
  leaderboardIdValidation,
  deleteLeaderboard,
);

export default router;
