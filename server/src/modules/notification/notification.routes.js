import { Router } from "express";

import notificationController from "./notification.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import adminMiddleware from "../../middleware/admin.middleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Notification Routes
|--------------------------------------------------------------------------
*/

router.post(
  "/welcome",
  authMiddleware,
  adminMiddleware,
  notificationController.sendWelcomeEmail,
);

router.post(
  "/order-placed",
  authMiddleware,
  adminMiddleware,
  notificationController.sendOrderPlacedEmail,
);

router.post(
  "/order-status",
  authMiddleware,
  adminMiddleware,
  notificationController.sendOrderStatusEmail,
);

router.post(
  "/custom",
  authMiddleware,
  adminMiddleware,
  notificationController.sendCustomEmail,
);

export default router;