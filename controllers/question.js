import I18n from "i18n";
import { validationResult } from "express-validator";

import Question from "../models/question.js";

import { DOST_NOT_EXIST } from "../util/constants.js";

import { expressValidatorHandler } from "../util/helper-functions.js";

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

export const getQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find()
      .populate("categoryId", "name")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      code: 0,
      data: questions,
    });
  } catch (err) {
    next(err);
  }
};

export const getQuestionsByCategoryId = async (req, res, next) => {
  try {
    const questions = await Question.find({ categoryId: req.params.id })
      .populate("categoryId", "name")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      code: 0,
      data: questions,
    });
  } catch (err) {
    next(err);
  }
};

export const getQuestionDetails = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id).populate(
      "categoryId",
      "name",
    );

    if (!question) {
      const error = new Error(I18n.__(DOST_NOT_EXIST));
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      code: 0,
      data: question,
    });
  } catch (err) {
    next(err);
  }
};

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
*/

export const postQuestion = async (req, res, next) => {
  try {
    expressValidatorHandler(validationResult(req));
    const { categoryId, question, answer, jokerAnswer } = req.body;
    const questionModel = new Question({
      categoryId: categoryId,
      question: question,
      answer: answer,
      jokerAnswer: jokerAnswer,
    });

    await question.save();

    res.status(201).json({
      code: 0,
      data: questionModel,
    });
  } catch (err) {
    next(err);
  }
};

export const postBulkQuestions = async (req, res, next) => {
  try {
    expressValidatorHandler(validationResult(req));

    const { questions } = req.body;

    const createdQuestions = await Question.insertMany(questions, {
      ordered: true,
    });

    res.status(201).json({
      code: 0,
      data: createdQuestions,
    });
  } catch (err) {
    next(err);
  }
};
/*
|--------------------------------------------------------------------------
| PUT
|--------------------------------------------------------------------------
*/

export const putQuestion = async (req, res, next) => {
  try {
    expressValidatorHandler(validationResult(req));

    const questionModel = await Question.findById(req.params.id);

    const { categoryId, question, answer, jokerAnswer } = req.body;
    if (!question) {
      const error = new Error(I18n.__(DOST_NOT_EXIST));
      error.statusCode = 404;
      throw error;
    }

    if (categoryId) {
      question.categoryId = categoryId;
    }

    if (question) {
      question.question = question;
    }
    if (answer) {
      question.answer = answer;
    }
    if (jokerAnswer) {
      question.jokerAnswer = jokerAnswer;
    }

    await questionModel.save();

    res.status(200).json({
      code: 0,
      data: question,
    });
  } catch (err) {
    next(err);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

export const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      const error = new Error(I18n.__(DOST_NOT_EXIST));
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      code: 0,
      data: question,
    });
  } catch (err) {
    next(err);
  }
};
