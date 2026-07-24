import I18n from "i18n";
import { validationResult } from "express-validator";

import Category from "../models/category.js";

import { GENERAL_ERROR, DOST_NOT_EXIST } from "../util/constants.js";

import { expressValidatorHandler } from "../util/helper-functions.js";

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      code: 0,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
};

export const getCategoryDetails = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      const error = new Error(I18n.__(DOST_NOT_EXIST));
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      code: 0,
      data: category,
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

export const postCategory = async (req, res, next) => {
  try {
    expressValidatorHandler(validationResult(req));
    const { name, description } = req.body;
    const category = new Category({
      name,
      description,
    });

    await category.save();

    res.status(201).json({
      code: 0,
      data: category,
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

export const putCategory = async (req, res, next) => {
  try {
    expressValidatorHandler(validationResult(req));
    const { name, description } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      const error = new Error(I18n.__(DOST_NOT_EXIST));
      error.statusCode = 404;
      throw error;
    }

    if (name) {
      category.name = name;
    }

    if (description) {
      category.description = description;
    }

    await category.save();

    res.status(200).json({
      code: 0,
      data: category,
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

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      const error = new Error(I18n.__(DOST_NOT_EXIST));
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      code: 0,
      data: category,
    });
  } catch (err) {
    next(err);
  }
};
