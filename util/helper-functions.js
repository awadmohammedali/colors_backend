import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const expressValidatorHandler = (errorArray) => {
  if (errorArray.errors.length !== 0) {
    console.log("location ======== expressValidatorHandler");
    console.log(errorArray.array()[0]);
    const error = new Error(errorArray.array()[0]["msg"]);
    error.statusCode = 400;
    throw error;
  }
};

export { expressValidatorHandler };
