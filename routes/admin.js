import express from "express";

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

router.post("/categories", createCategoryValidation, postCategory);

router.get("/categories", getCategories);

router.get("/categories/:id", mongoIdValidation, getCategoryDetails);

router.put(
  "/categories/:id",
  mongoIdValidation,
  updateCategoryValidation,
  putCategory,
);

router.delete("/categories/:id", mongoIdValidation, deleteCategory);

/*
|--------------------------------------------------------------------------
| User routes
|--------------------------------------------------------------------------
*/

router.post("/user", createUserValidation, postSignup);

router.get("/users", getUsers);

router.get("/users/:id", mongoIdValidation, getUserDetails);

router.delete("/users/:id", mongoIdValidation, deleteUser);

/*
|--------------------------------------------------------------------------
| Color routes
|--------------------------------------------------------------------------
*/

router.post("/color", createColorValidation, postColor);

router.get("/color", getColors);

router.get("/color/:id", mongoIdValidation, getColorDetails);

router.put("/color/:id", mongoIdValidation, updateColorValidation, putColor);

router.delete("/color/:id", mongoIdValidation, deleteColor);

/*
|--------------------------------------------------------------------------
| Game variant routes
|--------------------------------------------------------------------------
*/

router.post("/game-variants", createGameVariantValidation, postGameVariant);

router.get("/game-variants", getGameVariants);

router.get("/game-variants/:id", mongoIdValidation, getGameVariantDetails);

router.put(
  "/game-variants/:id",
  mongoIdValidation,
  updateGameVariantValidation,
  putGameVariant,
);

router.delete("/game-variants/:id", mongoIdValidation, deleteGameVariant);

/*
|--------------------------------------------------------------------------
| Question routes
|--------------------------------------------------------------------------
*/

router.post("/question", createQuestionValidation, postQuestion);

router.post("/question/bulk", bulkQuestionsValidation, postBulkQuestions);

router.get("/question", getQuestions);

router.get("/question/:id", mongoIdValidation, getQuestionDetails);

router.put(
  "/question/:id",
  mongoIdValidation,
  updateQuestionValidation,
  putQuestion,
);

router.delete("/question/:id", mongoIdValidation, deleteQuestion);

/*
|--------------------------------------------------------------------------
| App config routes
|--------------------------------------------------------------------------
*/

router.get("/app-config", getAppConfig);

router.put("/app-config", updateAppConfigValidation, putAppConfig);

export default router;
