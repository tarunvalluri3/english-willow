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

    if (role === "SUPER_ADMIN" && currentUser.role !== "SUPER_ADMIN") {
      throw new ApiError(
        403,
        "Only a SUPER_ADMIN can assign the SUPER_ADMIN role.",
      );
    }

    this._assertCanModifyPrivilegedUser(user, currentUser);
    await this._assertNotRemovingLastSuperAdmin(user, role !== "SUPER_ADMIN");

    return userRepository.update(id, {
      role,
    });
  }

  async updateUserStatus(id, status, currentUser) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    this._assertCanModifyPrivilegedUser(user, currentUser);
    await this._assertNotRemovingLastSuperAdmin(user, status !== "ACTIVE");

    return userRepository.update(id, {
      status,
    });
  }

  async deleteUser(id, currentUser) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    this._assertCanModifyPrivilegedUser(user, currentUser);
    await this._assertNotRemovingLastSuperAdmin(user, true);

    await userRepository.softDelete(id);

    return {
      message: "User deactivated successfully.",
    };
  }

  _assertCanModifyPrivilegedUser(targetUser, currentUser) {
    if (
      targetUser.role === "SUPER_ADMIN" &&
      currentUser.role !== "SUPER_ADMIN"
    ) {
      throw new ApiError(
        403,
        "Only a SUPER_ADMIN can modify a SUPER_ADMIN account.",
      );
    }
  }

  async _assertNotRemovingLastSuperAdmin(user, removesAccess) {
    if (!removesAccess || user.role !== "SUPER_ADMIN") return;

    const activeSuperAdminCount = await userRepository.countActiveSuperAdmins();
    if (activeSuperAdminCount <= 1) {
      throw new ApiError(400, "At least one active SUPER_ADMIN must remain.");
    }
  }
}

export default new UserService();
