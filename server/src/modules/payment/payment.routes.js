import { Router } from "express";

import paymentController from "./payment.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import adminMiddleware from "../../middleware/admin.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import {
  paymentIdSchema,
  createPaymentSchema,
  verifyPaymentSchema,
  refundPaymentSchema,
  listPaymentsSchema,
} from "./payment.validator.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Customer Payment Routes
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authMiddleware,
  validate(createPaymentSchema),
  paymentController.createPayment
);

router.post(
  "/verify",
  authMiddleware,
  validate(verifyPaymentSchema),
  paymentController.verifyPayment
);

router.get(
  "/:id",
  authMiddleware,
  validate(paymentIdSchema),
  paymentController.getPaymentById
);

/*
|--------------------------------------------------------------------------
| Admin Payment Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  validate(listPaymentsSchema),
  paymentController.getPayments
);

router.patch(
  "/:id/refund",
  authMiddleware,
  adminMiddleware,
  validate(refundPaymentSchema),
  paymentController.refundPayment
);

export default router;