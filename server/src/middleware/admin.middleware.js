import ApiError from "../common/ApiError.js";

const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Unauthorized"));
  }

  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
    return next(
      new ApiError(
        403,
        "You do not have permission to perform this action"
      )
    );
  }

  next();
};

export default adminMiddleware;