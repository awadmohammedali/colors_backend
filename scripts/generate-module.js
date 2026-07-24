import fs from "fs";
import path from "path";

const moduleName = process.argv[2];

if (!moduleName) {
  console.error(
    "Please provide a module name. Example: npm run generate:module category",
  );

  process.exit(1);
}

const toPascalCase = (value) =>
  value
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

const toCamelCase = (value) => {
  const pascalCase = toPascalCase(value);

  return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
};

const toKebabCase = (value) =>
  value
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();

const toPlural = (value) => {
  if (value.endsWith("y")) {
    return `${value.slice(0, -1)}ies`;
  }

  if (
    value.endsWith("s") ||
    value.endsWith("x") ||
    value.endsWith("ch") ||
    value.endsWith("sh")
  ) {
    return `${value}es`;
  }

  return `${value}s`;
};

const pascalName = toPascalCase(moduleName);
const camelName = toCamelCase(moduleName);
const kebabName = toKebabCase(moduleName);

const pluralCamelName = toPlural(camelName);
const pluralKebabName = toPlural(kebabName);

const rootPath = process.cwd();

const files = [
  {
    path: path.join(rootPath, "models", `${kebabName}.js`),
    content: `import mongoose from "mongoose";

const { Schema } = mongoose;

const ${camelName}Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model(
  "${pascalName}",
  ${camelName}Schema,
);
`,
  },

  {
    path: path.join(rootPath, "controllers", `${kebabName}-controller.js`),
    content: `import { validationResult } from "express-validator";

import ${pascalName} from "../models/${kebabName}.js";

import {
  expressValidatorHandler,
} from "../util/helper-functions.js";

/*
|--------------------------------------------------------------------------
| GET ALL
|--------------------------------------------------------------------------
*/

export const get${toPascalCase(pluralCamelName)} = async (
  req,
  res,
  next,
) => {
  try {
    const ${pluralCamelName} = await ${pascalName}
      .find()
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      code: 0,
      data: ${pluralCamelName},
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

export const get${pascalName}Details = async (
  req,
  res,
  next,
) => {
  try {
    expressValidatorHandler(validationResult(req));

    const ${camelName} = await ${pascalName}.findById(
      req.params.id,
    );

    if (!${camelName}) {
      const err = new Error("${pascalName} does not exist");
      err.statusCode = 404;

      throw err;
    }

    res.status(200).json({
      code: 0,
      data: ${camelName},
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

export const post${pascalName} = async (
  req,
  res,
  next,
) => {
  try {
    expressValidatorHandler(validationResult(req));

    const { name } = req.body;

    const ${camelName} = new ${pascalName}({
      name,
    });

    await ${camelName}.save();

    res.status(201).json({
      code: 0,
      data: ${camelName},
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

export const put${pascalName} = async (
  req,
  res,
  next,
) => {
  try {
    expressValidatorHandler(validationResult(req));

    const ${camelName} = await ${pascalName}.findById(
      req.params.id,
    );

    if (!${camelName}) {
      const err = new Error("${pascalName} does not exist");
      err.statusCode = 404;

      throw err;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        req.body,
        "name",
      )
    ) {
      ${camelName}.name = req.body.name;
    }

    await ${camelName}.save();

    res.status(200).json({
      code: 0,
      data: ${camelName},
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

export const delete${pascalName} = async (
  req,
  res,
  next,
) => {
  try {
    expressValidatorHandler(validationResult(req));

    const ${camelName} = await ${pascalName}.findById(
      req.params.id,
    );

    if (!${camelName}) {
      const err = new Error("${pascalName} does not exist");
      err.statusCode = 404;

      throw err;
    }

    await ${camelName}.deleteOne();

    res.status(200).json({
      code: 0,
      data: ${camelName},
    });
  } catch (err) {
    next(err);
  }
};
`,
  },

  {
    path: path.join(rootPath, "validations", `${kebabName}-validator.js`),
    content: `import { body, param } from "express-validator";

export const ${camelName}IdValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid ${pascalName} ID"),
];

export const create${pascalName}Validation = [
  body("name")
    .notEmpty()
    .withMessage("${pascalName} name is required"),
];

export const update${pascalName}Validation = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("${pascalName} name cannot be empty"),
];
`,
  },

  {
    path: path.join(rootPath, "routes", `${kebabName}-routes.js`),
    content: `import express from "express";

import isAdminAuth from "../middlewares/is-admin-auth.js";

import {
  get${toPascalCase(pluralCamelName)},
  get${pascalName}Details,
  post${pascalName},
  put${pascalName},
  delete${pascalName},
} from "../controllers/${kebabName}-controller.js";

import {
  ${camelName}IdValidation,
  create${pascalName}Validation,
  update${pascalName}Validation,
} from "../validations/${kebabName}-validator.js";

const router = express.Router();

router.post(
  "/admin/${pluralKebabName}",
  isAdminAuth,
  create${pascalName}Validation,
  post${pascalName},
);

router.get(
  "/admin/${pluralKebabName}",
  isAdminAuth,
  get${toPascalCase(pluralCamelName)},
);

router.get(
  "/admin/${pluralKebabName}/:id",
  isAdminAuth,
  ${camelName}IdValidation,
  get${pascalName}Details,
);

router.put(
  "/admin/${pluralKebabName}/:id",
  isAdminAuth,
  ${camelName}IdValidation,
  update${pascalName}Validation,
  put${pascalName},
);

router.delete(
  "/admin/${pluralKebabName}/:id",
  isAdminAuth,
  ${camelName}IdValidation,
  delete${pascalName},
);

export default router;
`,
  },
];

for (const file of files) {
  const directory = path.dirname(file.path);

  fs.mkdirSync(directory, {
    recursive: true,
  });

  if (fs.existsSync(file.path)) {
    console.warn(
      `Skipped: ${path.relative(rootPath, file.path)} already exists`,
    );

    continue;
  }

  fs.writeFileSync(file.path, file.content, "utf8");

  console.log(`Created: ${path.relative(rootPath, file.path)}`);
}

console.log(`\n${pascalName} module generated successfully.`);
