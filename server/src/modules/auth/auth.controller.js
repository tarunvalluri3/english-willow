import asyncHandler from "../../common/asyncHandler.js";
import ApiResponse from "../../common/ApiResponse.js";

import authService from "./auth.service.js";

class AuthController {
  getCurrentUser = asyncHandler(async (req, res) => {
    const user = await authService.getCurrentUser(req.user.id);

    return res.status(200).json(
      new ApiResponse(
        200,
        "User fetched successfully.",
        user,
      ),
    );
  });

  updateProfile = asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(
      req.user.id,
      req.body,
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Profile updated successfully.",
        user,
      ),
    );
  });

  deactivateAccount = asyncHandler(async (req, res) => {
    await authService.deactivateAccount(req.user.id);

    return res.status(200).json(
      new ApiResponse(
        200,
        "Account deactivated successfully.",
        null,
      ),
    );
  });
}

export default new AuthController();