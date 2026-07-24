import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import i18n from "i18n";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import adminRouter from "./routes/admin.js";

// -----------------------------------------------------------------------------
// Paths
// -----------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------------------------------------------------------
// App configuration
// -----------------------------------------------------------------------------

const app = express();

const PORT = process.env.PORT ?? 3000;
const REDIS_URL = process.env.REDIS_URL;

// -----------------------------------------------------------------------------
// Logging
// -----------------------------------------------------------------------------

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  {
    flags: "a",
  },
);

// Setup morgan later using accessLogStream.

// -----------------------------------------------------------------------------
// CORS
// -----------------------------------------------------------------------------

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "lang"],
  }),
);

// -----------------------------------------------------------------------------
// Request parsers
// -----------------------------------------------------------------------------

app.use(
  express.json({
    limit: "1mb",
  }),
);

// -----------------------------------------------------------------------------
// Internationalization
// -----------------------------------------------------------------------------

i18n.configure({
  locales: ["en", "ar"],
  directory: path.join(__dirname, "locale"),
  defaultLocale: "ar",
  autoReload: true,
  syncFiles: true,
});

app.use(i18n.init);

app.use((req, res, next) => {
  const requestedLocale = req.get("lang") ?? "ar";

  i18n.setLocale(requestedLocale);

  next();
});

// -----------------------------------------------------------------------------
// Static files
// -----------------------------------------------------------------------------

app.use("/data/images", express.static(path.join(__dirname, "data", "images")));

// -----------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------

app.use("/admin", adminRouter);
// app.use("/api/users", userRoutes);
// app.use("/api/matches", matchRoutes);

// -----------------------------------------------------------------------------
// Error middleware
// -----------------------------------------------------------------------------

app.use((error, req, res, next) => {
  const status = error.statusCode ?? 500;
  const message = error.message ?? i18n.__("GENERAL_ERROR");

  res.status(status).json({
    code: error.code ?? 1,
    message,
  });
});

// -----------------------------------------------------------------------------
// Database and server startup
// -----------------------------------------------------------------------------

mongoose
  .connect(process.env.MONGODB_URI_DEV)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server connected and running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`Mongoose database error: ${error}`);
  });
