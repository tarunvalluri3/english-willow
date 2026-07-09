import { Router } from "express";

import couponController from "./coupon.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import adminMiddleware from "../../middleware/admin.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import {
  couponIdSchema,
  createCouponSchema,
  updateCouponSchema,
  deleteCouponSchema,
  applyCouponSchema,
  listCouponsSchema,
} from "./coupon.validator.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.post(
  "/apply",
  validate(applyCouponSchema),
  couponController.applyCoupon,
);

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  validate(listCouponsSchema),
  couponController.getCoupons,
);

router.get(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validate(couponIdSchema),
  couponController.getCouponById,
);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  validate(createCouponSchema),
  couponController.createCoupon,
);

router.patch(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validate(updateCouponSchema),
  couponController.updateCoupon,
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validate(deleteCouponSchema),
  couponController.deleteCoupon,
);

export default router;