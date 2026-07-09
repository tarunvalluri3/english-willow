import ApiError from "../../common/ApiError.js";

import {
  getPagination,
  getPaginationMeta,
} from "../../common/pagination.js";

import userRepository from "./user.repository.js";

class UserService {
  async getUsers(query) {
    const { page, limit, skip } = getPagination(query);

    const filters = {
      skip,
      take: limit,
      role: query.role,
      status: query.status,
      search: query.search,
    };

    const [users, totalItems] = await Promise.all([
      userRepository.findMany(filters),
      userRepository.count(filters),
    ]);

    return {
      users,
      meta: getPaginationMeta(
        page,
        limit,
        totalItems,
      ),
    };
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    return user;
  }

  async updateUserRole(id, role, currentUser) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    if (
      role === "SUPER_ADMIN" &&
      currentUser.role !== "SUPER_ADMIN"
    ) {
      throw new ApiError(
        403,
        "Only a SUPER_ADMIN can assign the SUPER_ADMIN role.",
      );
    }

    return userRepository.update(id, {
      role,
    });
  }

  async updateUserStatus(id, status) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    return userRepository.update(id, {
      status,
    });
  }

  async deleteUser(id) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    await userRepository.softDelete(id);

    return {
      message: "User deactivated successfully.",
    };
  }
}

export default new UserService();