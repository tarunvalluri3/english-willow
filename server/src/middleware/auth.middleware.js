import { getAuth } from "@clerk/express";

import prisma from "../config/prisma.js";
import ApiError from "../common/ApiError.js";

const authMiddleware = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return next(new ApiError(401, "Unauthorized"));
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      return next(new ApiError(401, "User not found"));
    }

    if (user.status !== "ACTIVE") {
      return next(new ApiError(403, "User account is not active"));
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;