import { Router } from "express";

import productController from "./product.controller.js";

import validate from "../../middleware/validate.middleware.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import adminMiddleware from "../../middleware/admin.middleware.js";

import {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  listProductsSchema,
} from "./product.validator.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  validate(listProductsSchema),
  productController.getProducts
);

router.get(
  "/:id",
  validate(productIdSchema),
  productController.getProductById
);

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  validate(createProductSchema),
  productController.createProduct
);

router.patch(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validate(updateProductSchema),
  productController.updateProduct
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validate(productIdSchema),
  productController.deleteProduct
);

export default router;