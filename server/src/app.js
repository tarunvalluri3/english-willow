import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import clerk from "./config/clerk.js";

import routes from "./routes/index.js";

import notFoundMiddleware from "./middleware/notFound.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

/*
 Global Middleware
*/

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

/*
Authentication
*/

app.use(clerk);

/*
Routes
*/

app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

app.use("/api", routes);

/* Error Handling */

app.use(notFoundMiddleware);

app.use(errorMiddleware);

export default app;
