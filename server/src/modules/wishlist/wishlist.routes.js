import { Router } from "express";

import wishlistController from "./wishlist.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import {
  getWishlistSchema,
  addWishlistItemSchema,
  wishlistItemIdSchema,
  clearWishlistSchema,
} from "./wishlist.validator.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Customer Wishlist Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  validate(getWishlistSchema),
  wishlistController.getWishlist
);

router.post(
  "/items",
  authMiddleware,
  validate(addWishlistItemSchema),
  wishlistController.addItem
);

router.delete(
  "/items/:itemId",
  authMiddleware,
  validate(wishlistItemIdSchema),
  wishlistController.removeItem
);

router.delete(
  "/",
  authMiddleware,
  validate(clearWishlistSchema),
  wishlistController.clearWishlist
);

export default router;