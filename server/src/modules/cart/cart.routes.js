import { Router } from "express";

import cartController from "./cart.controller.js";

import validate from "../../middleware/validate.middleware.js";
import authMiddleware from "../../middleware/auth.middleware.js";

import {
  getCartSchema,
  addCartItemSchema,
  updateCartItemSchema,
  cartItemIdSchema,
  clearCartSchema,
} from "./cart.validator.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Customer Cart Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  validate(getCartSchema),
  cartController.getCart
);

router.post(
  "/items",
  authMiddleware,
  validate(addCartItemSchema),
  cartController.addItem
);

router.patch(
  "/items/:itemId",
  authMiddleware,
  validate(updateCartItemSchema),
  cartController.updateItem
);

router.delete(
  "/items/:itemId",
  authMiddleware,
  validate(cartItemIdSchema),
  cartController.removeItem
);

router.delete(
  "/",
  authMiddleware,
  validate(clearCartSchema),
  cartController.clearCart
);

export default router;