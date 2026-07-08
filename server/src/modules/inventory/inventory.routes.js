import { Router } from "express";

import inventoryController from "./inventory.controller.js";

import validate from "../../middleware/validate.middleware.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import adminMiddleware from "../../middleware/admin.middleware.js";

import {
  inventoryByVariantSchema,
  listInventorySchema,
  createInventoryTransactionSchema,
  listInventoryTransactionsSchema,
} from "./inventory.validator.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  validate(listInventorySchema),
  inventoryController.getInventory
);

router.get(
  "/transactions",
  authMiddleware,
  adminMiddleware,
  validate(listInventoryTransactionsSchema),
  inventoryController.getInventoryTransactions
);

router.get(
  "/:productVariantId",
  authMiddleware,
  adminMiddleware,
  validate(inventoryByVariantSchema),
  inventoryController.getInventoryByProductVariant
);

router.post(
  "/transactions",
  authMiddleware,
  adminMiddleware,
  validate(createInventoryTransactionSchema),
  inventoryController.createInventoryTransaction
);

export default router;