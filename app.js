import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import i18n from "i18n";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import adminRouter from "./routes/admin.js";
import { redisClient, subClient, connectRedis } from "./config/redis.js";
import { createAdapter } from "@socket.io/redis-adapter";
import http from "http";
import { Server } from "socket.io";
import { createClient } from "redis";
import initializeRoomSocket from "./socket/room.socket.js";
import initializeGameSocket from "./socket/game.socket.js";
import registerBlueSocketHandlers from "./socket/blue.socket.js";
import helmet from "helmet";

// -----------------------------------------------------------------------------
// Paths
// -----------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the project config file when they are not
// already present in the process environment.
if (!process.env.MONGODB_URI_DEV && !process.env.MONGODB_URI) {
  try {
    process.loadEnvFile(path.join(__dirname, "config", "dev.env"));
  } catch (error) {
    console.warn("Unable to load config/dev.env:", error.message);
  }
}

// -----------------------------------------------------------------------------
// App configuration
// -----------------------------------------------------------------------------

const app = express();

const PORT = process.env.PORT ?? 3000;
const MONGODB_URI = process.env.MONGODB_URI_DEV ?? process.env.MONGODB_URI;

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

app.use(helmet());
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

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  process.exit(1);
});

// -----------------------------------------------------------------------------
// Database and server startup
// -----------------------------------------------------------------------------

mongoose
  .connect(process.env.MONGODB_URI_DEV)
  .then(() => {
    console.log("MongoDB connected");

    return connectRedis();
  })
  .then(() => {
    console.log("Redis clients connected");

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    io.adapter(createAdapter(redisClient, subClient));

    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      initializeRoomSocket(io, socket);
      initializeGameSocket(io, socket);

      //-------colors socket handlers--------//
      registerBlueSocketHandlers(io, socket);

      socket.on("disconnect", (reason) => {
        console.log(`Socket disconnected: ${socket.id}. Reason: ${reason}`);
      });
    });

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
