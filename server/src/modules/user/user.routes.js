import { Router } from "express";

import userController from "./user.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import adminMiddleware from "../../middleware/admin.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import {
  userIdSchema,
  listUsersSchema,
  updateRoleSchema,
  updateStatusSchema,
} from "./user.validator.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| User Management (Admin Only)
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  validate(listUsersSchema),
  userController.getUsers,
);

router.get(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validate(userIdSchema),
  userController.getUserById,
);

router.patch(
  "/:id/role",
  authMiddleware,
  adminMiddleware,
  validate(updateRoleSchema),
  userController.updateUserRole,
);

router.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  validate(updateStatusSchema),
  userController.updateUserStatus,
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validate(userIdSchema),
  userController.deleteUser,
);

export default router;