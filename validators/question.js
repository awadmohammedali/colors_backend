import { body } from "express-validator";

const isNonEmptyObject = (value) => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length > 0
  );
};

export const createQuestionValidation = [
  body("categoryId")
    .notEmpty()
    .withMessage("Category ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid category ID"),

  body("question")
    .notEmpty()
    .withMessage("Question is required")
    .bail()
    .custom(isNonEmptyObject)
    .withMessage("Question must be a non-empty object"),

  body("answer")
    .notEmpty()
    .withMessage("Answer is required")
    .bail()
    .custom(isNonEmptyObject)
    .withMessage("Answer must be a non-empty object"),

  body("jokerAnswer")
    .optional()
    .custom(isNonEmptyObject)
    .withMessage("Joker answer must be a non-empty object"),
];

export const updateQuestionValidation = [
  body("categoryId").optional().isMongoId().withMessage("Invalid category ID"),

  body("question")
    .optional()
    .custom(isNonEmptyObject)
    .withMessage("Question must be a non-empty object"),

  body("answer")
    .optional()
    .custom(isNonEmptyObject)
    .withMessage("Answer must be a non-empty object"),

  body("jokerAnswer")
    .optional()
    .custom(isNonEmptyObject)
    .withMessage("Joker answer must be a non-empty object"),
];

export const bulkQuestionsValidation = [
  body("questions")
    .isArray({ min: 1 })
    .withMessage("Questions must be a non-empty array"),

  body("questions.*.categoryId")
    .notEmpty()
    .withMessage("Category ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid category ID"),

  body("questions.*.question")
    .notEmpty()
    .withMessage("Question is required")
    .bail()
    .custom(isNonEmptyObject)
    .withMessage("Question must be a non-empty object"),

  body("questions.*.answer")
    .notEmpty()
    .withMessage("Answer is required")
    .bail()
    .custom(isNonEmptyObject)
    .withMessage("Answer must be a non-empty object"),

  body("questions.*.jokerAnswer")
    .optional()
    .custom(isNonEmptyObject)
    .withMessage("Joker answer must be a non-empty object"),
];
