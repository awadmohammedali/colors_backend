import I18n from "i18n";
import { validationResult } from "express-validator";

import GameVariant from "../models/game-variant.js";

import { DOST_NOT_EXIST } from "../util/constants.js";

import { expressValidatorHandler } from "../util/helper-functions.js";

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

export const getGameVariants = async (req, res, next) => {
  try {
    const variants = await GameVariant.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      code: 0,
      data: variants,
    });
  } catch (err) {
    next(err);
  }
};

export const getGameVariantDetails = async (req, res, next) => {
  try {
    const variant = await GameVariant.findById(req.params.id);

    if (!variant) {
      const error = new Error(I18n.__(DOST_NOT_EXIST));
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      code: 0,
      data: variant,
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

export const postGameVariant = async (req, res, next) => {
  try {
    expressValidatorHandler(validationResult(req));
    const { name, instructions, icon, isActive, timer } = req.body;

    const variant = new GameVariant({
      name,
      instructions: instructions ?? {},
      icon,
      timer: timer,
    });

    await variant.save();

    res.status(201).json({
      code: 0,
      data: variant,
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

export const putGameVariant = async (req, res, next) => {
  try {
    expressValidatorHandler(validationResult(req));

    const { name, instruction, icon, isActive, timer } = req.body;
    const variant = await GameVariant.findById(req.params.id);

    if (!variant) {
      const error = new Error(I18n.__(DOST_NOT_EXIST));
      error.statusCode = 404;
      throw error;
    }

    if (name) {
      variant.name = name;
    }

    if (instruction) {
      variant.instruction = instruction;
    }
    if (isActive !== undefined) {
      variant.isActive = isActive;
    }
    if (timer !== undefined) {
      variant.timer = timer;
    }

    await variant.save();

    res.status(200).json({
      code: 0,
      data: variant,
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

export const deleteGameVariant = async (req, res, next) => {
  try {
    const variant = await GameVariant.findByIdAndDelete(req.params.id);

    if (!variant) {
      const error = new Error(I18n.__(DOST_NOT_EXIST));
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      code: 0,
      data: variant,
    });
  } catch (err) {
    next(err);
  }
};
