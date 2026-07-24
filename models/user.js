import I18n from "i18n";
import mongoose from "mongoose";
import { USER_EXIST } from "../util/constants.js";

const Schema = mongoose.Schema;

const usersSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      required: true,
    },

    sub: {
      type: String,
    },
  },
  { timestamps: true },
);

usersSchema.post("save", function (error, doc, next) {
  if (error.code === 11000) {
    next(new Error(I18n.__(USER_EXIST)));
  } else {
    next(error);
  }
});
export default mongoose.model("User", usersSchema);
