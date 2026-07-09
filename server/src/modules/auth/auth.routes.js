import { Router } from "express";

import authController from "./auth.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import { z } from "zod";

const router = Router();

/*
|--------------------------------------------------------------------------
| Validators
|--------------------------------------------------------------------------
*/

const updateProfileSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .optional(),

    lastName: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .optional(),

    phone: z
      .string()
      .trim()
      .max(20)
      .optional(),
  }),
});

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  authMiddleware,
  authController.getCurrentUser,
);

router.patch(
  "/profile",
  authMiddleware,
  validate(updateProfileSchema),
  authController.updateProfile,
);

router.delete(
  "/deactivate",
  authMiddleware,
  authController.deactivateAccount,
);

export default router;