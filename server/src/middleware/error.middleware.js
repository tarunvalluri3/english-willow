import logger from "../common/logger.js";
import ApiErrorResponse from "../common/ApiErrorResponse.js";

const errorMiddleware = (err, req, res, next) => {
  logger.error(err);

  const statusCode = err.statusCode || 500;

  const message =
    process.env.NODE_ENV === "production"
      ? statusCode === 500
        ? "Internal Server Error"
        : err.message
      : err.message;

  return res.status(statusCode).json(
    new ApiErrorResponse(
      statusCode,
      message,
      err.errors || null
    )
  );
};

export default errorMiddleware;