import { validationResult } from "express-validator";

import Leaderboard from "../models/leaderboard.js";

import {
  expressValidatorHandler,
} from "../util/helper-functions.js";

/*
|--------------------------------------------------------------------------
| GET ALL
|--------------------------------------------------------------------------
*/

export const getLeaderboards = async (
  req,
  res,
  next,
) => {
  try {
    const leaderboards = await Leaderboard
      .find()
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      code: 0,
      data: leaderboards,
    });
  } catch (err) {
    next(err);
  }
};

/*
|--------------------------------------------------------------------------
| GET DETAILS
|--------------------------------------------------------------------------
*/

export const getLeaderboardDetails = async (
  req,
  res,
  next,
) => {
  try {
    expressValidatorHandler(validationResult(req));

    const leaderboard = await Leaderboard.findById(
      req.params.id,
    );

    if (!leaderboard) {
      const err = new Error("Leaderboard does not exist");
      err.statusCode = 404;

      throw err;
    }

    res.status(200).json({
      code: 0,
      data: leaderboard,
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

export const postLeaderboard = async (
  req,
  res,
  next,
) => {
  try {
    expressValidatorHandler(validationResult(req));

    const { name } = req.body;

    const leaderboard = new Leaderboard({
      name,
    });

    await leaderboard.save();

    res.status(201).json({
      code: 0,
      data: leaderboard,
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

export const putLeaderboard = async (
  req,
  res,
  next,
) => {
  try {
    expressValidatorHandler(validationResult(req));

    const leaderboard = await Leaderboard.findById(
      req.params.id,
    );

    if (!leaderboard) {
      const err = new Error("Leaderboard does not exist");
      err.statusCode = 404;

      throw err;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "name",
      )
    ) {
      leaderboard.name = req.body.name;
    }

    await leaderboard.save();

    res.status(200).json({
      code: 0,
      data: leaderboard,
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

export const deleteLeaderboard = async (
  req,
  res,
  next,
) => {
  try {
    expressValidatorHandler(validationResult(req));

    const leaderboard = await Leaderboard.findById(
      req.params.id,
    );

    if (!leaderboard) {
      const err = new Error("Leaderboard does not exist");
      err.statusCode = 404;

      throw err;
    }

    await leaderboard.deleteOne();

    res.status(200).json({
      code: 0,
      data: leaderboard,
    });
  } catch (err) {
    next(err);
  }
};
