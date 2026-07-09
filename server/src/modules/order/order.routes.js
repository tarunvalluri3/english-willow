import { Router } from "express";

import orderController from "./order.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import adminMiddleware from "../../middleware/admin.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import {
  createOrderSchema,
  orderIdSchema,
  cancelOrderSchema,
  updateOrderStatusSchema,
  listOrdersSchema,
} from "./order.validator.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Customer Order Routes
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authMiddleware,
  validate(createOrderSchema),
  orderController.createOrder
);

router.get(
  "/",
  authMiddleware,
  validate(listOrdersSchema),
  orderController.getOrders
);

router.get(
  "/:id",
  authMiddleware,
  validate(orderIdSchema),
  orderController.getOrderById
);

router.patch(
  "/:id/cancel",
  authMiddleware,
  validate(cancelOrderSchema),
  orderController.cancelOrder
);

/*
|--------------------------------------------------------------------------
| Admin Order Routes
|--------------------------------------------------------------------------
*/

router.patch(
  "/admin/:id/status",
  authMiddleware,
  adminMiddleware,
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

export default router;