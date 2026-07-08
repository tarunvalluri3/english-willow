import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";

import logger from "./common/logger.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`
English Willow API Started
Server : http://localhost:${PORT}
Mode   : ${process.env.NODE_ENV}
`);
});

/*
Graceful Shutdown
*/

const shutdown = (signal) => {
  logger.info(`${signal} received. Shutting down server...`);

  server.close(() => {
    logger.info("HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));

process.on("SIGTERM", () => shutdown("SIGTERM"));

/*
Unhandled Errors
*/

process.on("uncaughtException", (error) => {
  logger.error(error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error(reason);

  server.close(() => {
    process.exit(1);
  });
});
