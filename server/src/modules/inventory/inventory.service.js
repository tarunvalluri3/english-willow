import prisma from "../../config/prisma.js";

import ApiError from "../../common/ApiError.js";
import {
  getPagination,
  getPaginationMeta,
} from "../../common/pagination.js";

import inventoryRepository from "./inventory.repository.js";
import inventoryTransactionRepository from "./inventoryTransaction.repository.js";

class InventoryService {
  async getInventory(query) {
    const { page, limit, skip } = getPagination(query);

    const filters = {
      skip,
      take: limit,
      search: query.search?.trim(),
      lowStock: query.lowStock,
    };

    const [inventory, totalItems] = await Promise.all([
      inventoryRepository.findMany(filters),
      inventoryRepository.count(filters),
    ]);

    return {
      inventory,
      meta: getPaginationMeta(page, limit, totalItems),
    };
  }

  async getInventoryByProductVariant(productVariantId) {
    const inventory =
      await inventoryRepository.findByProductVariantId(
        productVariantId
      );

    if (!inventory) {
      throw new ApiError(404, "Inventory not found.");
    }

    return inventory;
  }

  async getInventoryTransactions(query) {
    const { page, limit, skip } = getPagination(query);

    const filters = {
      skip,
      take: limit,
      productVariantId: query.productVariantId,
      type: query.type,
    };

    const [transactions, totalItems] = await Promise.all([
      inventoryTransactionRepository.findMany(filters),
      inventoryTransactionRepository.count(filters),
    ]);

    return {
      transactions,
      meta: getPaginationMeta(page, limit, totalItems),
    };
  }

  async createInventoryTransaction(data, userId = null) {
    const inventory =
      await inventoryRepository.findByProductVariantId(
        data.productVariantId
      );

    if (!inventory) {
      throw new ApiError(404, "Inventory not found.");
    }

    let quantityAvailable = inventory.quantityAvailable;

    switch (data.type) {
      case "PURCHASE":
      case "RESTOCK":
      case "RETURN":
      case "CANCELLATION":
        quantityAvailable += data.quantity;
        break;

      case "ORDER":
      case "DAMAGED":
        if (inventory.quantityAvailable < data.quantity) {
          throw new ApiError(
            400,
            "Insufficient inventory available."
          );
        }

        quantityAvailable -= data.quantity;
        break;

      case "MANUAL_ADJUSTMENT":
        quantityAvailable = data.quantity;
        break;

      default:
        throw new ApiError(
          400,
          "Invalid inventory transaction type."
        );
    }

    return prisma.$transaction(async (tx) => {
      const updatedInventory =
        await inventoryRepository.update(
          inventory.id,
          {
            quantityAvailable,
            lastStockUpdatedAt: new Date(),
          },
          tx
        );

      await inventoryTransactionRepository.create(
        {
          inventoryId: inventory.id,
          type: data.type,
          quantity: data.quantity,
          reason: data.reason,
          notes: data.notes,
          referenceId: data.referenceId,
          createdByUserId: userId,
        },
        tx
      );

      return updatedInventory;
    });
  }
}

export default new InventoryService();