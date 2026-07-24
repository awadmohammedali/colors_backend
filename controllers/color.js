import I18n from "i18n";
import { validationResult } from "express-validator";

import Color from "../models/color.js";

import { DOST_NOT_EXIST } from "../util/constants.js";

import { expressValidatorHandler } from "../util/helper-functions.js";

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

export const getColors = async (req, res, next) => {
  try {
    const colors = await Color.find().populate("variants").sort({
      order: 1,
      createdAt: -1,
    });

    res.status(200).json({
      code: 0,
      data: colors,
    });
  } catch (err) {
    next(err);
  }
};

export const getColorDetails = async (req, res, next) => {
  try {
    const color = await Color.findById(req.params.id).populate("variants");

    if (!color) {
      const error = new Error(I18n.__(DOST_NOT_EXIST));
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      code: 0,
      data: color,
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

export const postColor = async (req, res, next) => {
  try {
    expressValidatorHandler(validationResult(req));

    const { code, variants } = req.body;
    const color = new Color({
      code,
      variants,
    });

    await color.save();
    res.status(201).json({
      code: 0,
      data: color,
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

export const putColor = async (req, res, next) => {
  try {
    expressValidatorHandler(validationResult(req));

    const { code, icon, isActive, order, variants } = req.body;

    const color = await Color.findById(req.params.id);
    if (!color) {
      const error = new Error(I18n.__(DOST_NOT_EXIST));
      error.statusCode = 404;
      throw error;
    }

    if (code) {
      color.code = code;
    }
    if (icon) {
      color.icon = icon;
    }
    if (isActive !== undefined) {
      color.isActive = isActive;
    }

    if (variants) {
      color.variants = variants;
    }

    await color.save();

    res.status(200).json({
      code: 0,
      data: color,
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

export const deleteColor = async (req, res, next) => {
  try {
    const color = await Color.findByIdAndDelete(req.params.id);

    if (!color) {
      const error = new Error(I18n.__(DOST_NOT_EXIST));
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      code: 0,
      data: color,
    });
  } catch (err) {
    next(err);
  }
};
