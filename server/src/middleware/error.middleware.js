import logger from "../common/logger.js";
import ApiErrorResponse from "../common/ApiErrorResponse.js";
import { Prisma } from "@prisma/client";

const errorMiddleware = (err, req, res, next) => {
  logger.error(err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaErrors = {
      P2002: [409, "A record with this value already exists."],
      P2003: [400, "This record is referenced by another resource."],
      P2025: [404, "Record not found."],
    };
    const mapped = prismaErrors[err.code];
    if (mapped) {
      return res.status(mapped[0]).json(new ApiErrorResponse(mapped[0], mapped[1]));
    }
  }

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
