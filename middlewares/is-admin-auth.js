import jwt from "jsonwebtoken";
import I18n from "i18n";
import { NEED_AUTHORIZATION, TOKEN_EXPIRTED } from "../util/constants.js";

export default (req, res, next) => {
  let decodedToken;

  try {
    if (!req.get("Authorization")) {
      const error = new Error(I18n.__(NEED_AUTHORIZATION));
      error.statusCode = 401;
      throw error;
    }
    const token = req.get("Authorization").split(" ")[1];
    decodedToken = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    if (!decodedToken) {
      const error = new Error(I18n.__(NEED_AUTHORIZATION));
      error.statusCode = 401;
      throw error;
    }
    req.adminId = decodedToken.id;
    next();
  } catch (err) {
    if (err.message.includes("expired")) {
      err.message = I18n.__(TOKEN_EXPIRTED);
    }
    err.message = I18n.__(NEED_AUTHORIZATION);
    err.statusCode = 401;
    throw err;
  }
};
