import { body } from "express-validator";

export const createQuestionValidation = [
  body("categoryId")
    .notEmpty()
    .withMessage("Category ID is required")
    .isMongoId()
    .withMessage("Invalid category ID"),
  body("question")
    .notEmpty()
    .withMessage("Question is required")
    .isObject()
    .withMessage("Question must be an object"),
  body("answer")
    .notEmpty()
    .withMessage("Answer is required")
    .isObject()
    .withMessage("Answer must be an object"),
  body("fakeAnswer")
    .optional()
    .isObject()
    .withMessage("Fake answer must be an object"),
];

export const updateQuestionValidation = [
  body("categoryId").optional().isMongoId().withMessage("Invalid category ID"),
  body("question")
    .optional()
    .isObject()
    .withMessage("Question must be an object"),
  body("answer").optional().isObject().withMessage("Answer must be an object"),
  body("fakeAnswer")
    .optional()
    .isObject()
    .withMessage("Fake answer must be an object"),
];

export const bulkQuestionsValidation = [
  body("question")
    .isArray({ min: 1 })
    .withMessage("Questions must be a non-empty array"),
  body("question.*.categoryId")
    .notEmpty()
    .withMessage("Category ID is required")
    .isMongoId()
    .withMessage("Invalid category ID"),
  body("question.*.question")
    .notEmpty()
    .withMessage("Question is required")
    .isObject()
    .withMessage("Question must be an object"),
  body("question.*.answer")
    .notEmpty()
    .withMessage("Answer is required")
    .isObject()
    .withMessage("Answer must be an object"),
  body("question.*.fakeAnswer")
    .optional()
    .isObject()
    .withMessage("Fake answer must be an object"),
];
