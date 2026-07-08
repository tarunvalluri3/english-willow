import { Router } from "express";

import categoryController from "./category.controller.js";

import validate from "../../middleware/validate.middleware.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import adminMiddleware from "../../middleware/admin.middleware.js";

import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
  listCategoriesSchema,
} from "./category.validator.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  validate(listCategoriesSchema),
  categoryController.getCategories
);

router.get(
  "/:id",
  validate(categoryIdSchema),
  categoryController.getCategoryById
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
  validate(createCategorySchema),
  categoryController.createCategory
);

router.patch(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validate(updateCategorySchema),
  categoryController.updateCategory
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validate(categoryIdSchema),
  categoryController.deleteCategory
);

export default router;