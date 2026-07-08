import asyncHandler from "../../common/asyncHandler.js";
import ApiResponse from "../../common/ApiResponse.js";

import inventoryService from "./inventory.service.js";

class InventoryController {
  getInventory = asyncHandler(async (req, res) => {
    const { inventory, meta } = await inventoryService.getInventory(
      req.query
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Inventory fetched successfully.",
        inventory,
        meta
      )
    );
  });

  getInventoryByProductVariant = asyncHandler(async (req, res) => {
    const inventory =
      await inventoryService.getInventoryByProductVariant(
        req.params.productVariantId
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Inventory fetched successfully.",
        inventory
      )
    );
  });

  getInventoryTransactions = asyncHandler(async (req, res) => {
    const { transactions, meta } =
      await inventoryService.getInventoryTransactions(req.query);

    return res.status(200).json(
      new ApiResponse(
        200,
        "Inventory transactions fetched successfully.",
        transactions,
        meta
      )
    );
  });

  createInventoryTransaction = asyncHandler(async (req, res) => {
    const inventory =
      await inventoryService.createInventoryTransaction(
        req.body,
        req.user?.id ?? null
      );

    return res.status(201).json(
      new ApiResponse(
        201,
        "Inventory transaction created successfully.",
        inventory
      )
    );
  });
}

export default new InventoryController();