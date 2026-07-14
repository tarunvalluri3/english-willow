import asyncHandler from "../../common/asyncHandler.js";
import ApiResponse from "../../common/ApiResponse.js";

import userService from "./user.service.js";

class UserController {
  getUsers = asyncHandler(async (req, res) => {
    const result = await userService.getUsers(req.query);

    return res.status(200).json(
      new ApiResponse(
        200,
        "Users fetched successfully.",
        result,
      ),
    );
  });

  getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(
      req.params.id,
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "User fetched successfully.",
        user,
      ),
    );
  });

  updateUserRole = asyncHandler(async (req, res) => {
    const user = await userService.updateUserRole(
      req.params.id,
      req.body.role,
      req.user,
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "User role updated successfully.",
        user,
      ),
    );
  });

  updateUserStatus = asyncHandler(async (req, res) => {
    const user = await userService.updateUserStatus(
      req.params.id,
      req.body.status,
      req.user,
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "User status updated successfully.",
        user,
      ),
    );
  });

  deleteUser = asyncHandler(async (req, res) => {
    const result = await userService.deleteUser(
      req.params.id,
      req.user,
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        result.message,
        null,
      ),
    );
  });
}

export default new UserController();
