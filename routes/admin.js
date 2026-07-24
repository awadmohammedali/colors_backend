import express from "express";

import isAdminAuth from "../middlewares/is-admin-auth.js";
import { mongoIdValidation } from "../validators/common.js";
import {
  createCategoryValidation,
  updateCategoryValidation,
} from "../validators/category.js";
import { createUserValidation } from "../validators/user.js";
import {
  createColorValidation,
  updateColorValidation,
} from "../validators/color.js";
import {
  createGameVariantValidation,
  updateGameVariantValidation,
} from "../validators/game-variant.js";
import {
  createQuestionValidation,
  updateQuestionValidation,
  bulkQuestionsValidation,
} from "../validators/question.js";
import { updateAppConfigValidation } from "../validators/app-config.js";

import {
  postCategory,
  getCategories,
  getCategoryDetails,
  putCategory,
  deleteCategory,
} from "../controllers/category.js";
import {
  postSignup,
  getUsers,
  getUserDetails,
  deleteUser,
} from "../controllers/user.js";
import {
  postColor,
  getColors,
  getColorDetails,
  putColor,
  deleteColor,
} from "../controllers/color.js";
import {
  postGameVariant,
  getGameVariants,
  getGameVariantDetails,
  putGameVariant,
  deleteGameVariant,
} from "../controllers/game-variant.js";
import {
  postQuestion,
  postBulkQuestions,
  getQuestions,
  getQuestionDetails,
  putQuestion,
  deleteQuestion,
} from "../controllers/question.js";
import { getAppConfig, putAppConfig } from "../controllers/app-config.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Category routes
|--------------------------------------------------------------------------
*/

router.post(
  "/admin/categories",
  isAdminAuth,
  createCategoryValidation,
  postCategory,
);

router.get("/admin/categories", isAdminAuth, getCategories);

router.get(
  "/admin/categories/:id",
  isAdminAuth,
  mongoIdValidation,
  getCategoryDetails,
);

router.put(
  "/admin/categories/:id",
  isAdminAuth,
  mongoIdValidation,
  updateCategoryValidation,
  putCategory,
);

router.delete(
  "/admin/categories/:id",
  isAdminAuth,
  mongoIdValidation,
  deleteCategory,
);

/*
|--------------------------------------------------------------------------
| User routes
|--------------------------------------------------------------------------
*/

router.post("/admin/user", isAdminAuth, createUserValidation, postSignup);

router.get("/admin/users", isAdminAuth, getUsers);

router.get("/admin/users/:id", isAdminAuth, mongoIdValidation, getUserDetails);

router.delete("/admin/users/:id", isAdminAuth, mongoIdValidation, deleteUser);

/*
|--------------------------------------------------------------------------
| Color routes
|--------------------------------------------------------------------------
*/

router.post("/admin/color", isAdminAuth, createColorValidation, postColor);

router.get("/admin/color", isAdminAuth, getColors);

router.get("/admin/color/:id", isAdminAuth, mongoIdValidation, getColorDetails);

router.put(
  "/admin/color/:id",
  isAdminAuth,
  mongoIdValidation,
  updateColorValidation,
  putColor,
);

router.delete("/admin/color/:id", isAdminAuth, mongoIdValidation, deleteColor);

/*
|--------------------------------------------------------------------------
| Game variant routes
|--------------------------------------------------------------------------
*/

router.post(
  "/admin/game-variants",
  isAdminAuth,
  createGameVariantValidation,
  postGameVariant,
);

router.get("/admin/game-variants", isAdminAuth, getGameVariants);

router.get(
  "/admin/game-variants/:id",
  isAdminAuth,
  mongoIdValidation,
  getGameVariantDetails,
);

router.put(
  "/admin/game-variants/:id",
  isAdminAuth,
  mongoIdValidation,
  updateGameVariantValidation,
  putGameVariant,
);

router.delete(
  "/admin/game-variants/:id",
  isAdminAuth,
  mongoIdValidation,
  deleteGameVariant,
);

/*
|--------------------------------------------------------------------------
| Question routes
|--------------------------------------------------------------------------
*/

router.post(
  "/admin/question",
  isAdminAuth,
  createQuestionValidation,
  postQuestion,
);

router.post(
  "/admin/question/bulk",
  isAdminAuth,
  bulkQuestionsValidation,
  postBulkQuestions,
);

router.get("/admin/question", isAdminAuth, getQuestions);

router.get(
  "/admin/question/:id",
  isAdminAuth,
  mongoIdValidation,
  getQuestionDetails,
);

router.put(
  "/admin/question/:id",
  isAdminAuth,
  mongoIdValidation,
  updateQuestionValidation,
  putQuestion,
);

router.delete(
  "/admin/question/:id",
  isAdminAuth,
  mongoIdValidation,
  deleteQuestion,
);

/*
|--------------------------------------------------------------------------
| App config routes
|--------------------------------------------------------------------------
*/

router.get("/admin/app-config", isAdminAuth, getAppConfig);

router.put(
  "/admin/app-config",
  isAdminAuth,
  updateAppConfigValidation,
  putAppConfig,
);

export default router;
