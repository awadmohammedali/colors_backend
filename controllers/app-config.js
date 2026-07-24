import I18n from "i18n";
import { validationResult } from "express-validator";

import AppConfig from "../models/app-config.js";

import { GENERAL_ERROR } from "../util/constants.js";

import { expressValidatorHandler } from "../util/helper-functions.js";

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

export const getAppConfig = async (req, res, next) => {
  try {
    let appConfig = await AppConfig.findOne({
      key: "APP_CONFIG",
    });

    if (!appConfig) {
      appConfig = await AppConfig.create({
        key: "APP_CONFIG",
      });
    }

    res.status(200).json({
      code: 0,
      data: appConfig,
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

export const putAppConfig = async (req, res, next) => {
  try {
    expressValidatorHandler(validationResult(req));

    let appConfig = await AppConfig.findOne({
      key: "APP_CONFIG",
    });

    if (!appConfig) {
      appConfig = new AppConfig({
        key: "APP_CONFIG",
      });
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "androidAppVersion")) {
      appConfig.androidAppVersion = req.body.androidAppVersion;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "IOSAppVersion")) {
      appConfig.IOSAppVersion = req.body.IOSAppVersion;
    }

    await appConfig.save();

    res.status(200).json({
      code: 0,
      data: appConfig,
    });
  } catch (err) {
    if (err.code === 11000) {
      err.message = I18n.__(GENERAL_ERROR);
      err.statusCode = 409;
    }

    next(err);
  }
};
