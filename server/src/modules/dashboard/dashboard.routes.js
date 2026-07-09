import { Router } from "express";

import dashboardController from "./dashboard.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import adminMiddleware from "../../middleware/admin.middleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Dashboard Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/summary",
  authMiddleware,
  adminMiddleware,
  dashboardController.getSummary,
);

router.get(
  "/recent-orders",
  authMiddleware,
  adminMiddleware,
  dashboardController.getRecentOrders,
);

router.get(
  "/low-stock",
  authMiddleware,
  adminMiddleware,
  dashboardController.getLowStockProducts,
);

router.get(
  "/top-products",
  authMiddleware,
  adminMiddleware,
  dashboardController.getTopProducts,
);

router.get(
  "/recent-customers",
  authMiddleware,
  adminMiddleware,
  dashboardController.getRecentCustomers,
);

export default router;