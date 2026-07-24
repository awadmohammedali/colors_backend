import jwt from "jsonwebtoken";
import i18n from "i18n";
import { NEED_AUTHORIZATION, TOKEN_EXPIRTED } from "../util/constants.js";

export default (req, res, next) => {
  let decodedToken;

  try {
    if (!req.get("Authorization")) {
      const error = new Error(i18n.__(NEED_AUTHORIZATION));
      error.statusCode = 401;
      throw error;
    }
    const token = req.get("Authorization").split(" ")[1];
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken) {
      const error = new Error(i18n.__(NEED_AUTHORIZATION));
      error.statusCode = 401;
      throw error;
    }
    req.userId = decodedToken.id;
    next();
  } catch (err) {
    if (err.message.includes("expired")) {
      err.message = i18n.__(TOKEN_EXPIRTED);
    }
    err.message = i18n.__(NEED_AUTHORIZATION);
    err.statusCode = 401;
    throw err;
  }
};
