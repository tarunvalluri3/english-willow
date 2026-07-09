import ApiError from "../../common/ApiError.js";

import prisma from "../../config/prisma.js";

class AuthService {
  async getCurrentUser(userId) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      include: {
        addresses: true,
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    return user;
  }

  async updateProfile(userId, data) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    return prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        firstName: data.firstName,

        lastName: data.lastName,

        phone: data.phone,
      },
    });
  }

  async deactivateAccount(userId) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    return prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        status: "INACTIVE",

        deletedAt: new Date(),
      },
    });
  }
}

export default new AuthService();