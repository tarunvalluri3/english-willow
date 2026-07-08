import prisma from "../../config/prisma.js";

class InventoryTransactionRepository {
  async create(data, tx = prisma) {
    return tx.inventoryTransaction.create({
      data,
    });
  }

  async findMany({
    skip,
    take,
    productVariantId,
    type,
  }, tx = prisma) {
    return tx.inventoryTransaction.findMany({
      where: {
        ...(type && { type }),

        ...(productVariantId && {
          inventory: {
            productVariantId,
          },
        }),
      },

      include: {
        inventory: {
          include: {
            productVariant: {
              include: {
                product: true,
              },
            },
          },
        },

        createdBy: true,
      },

      skip,
      take,

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async count({
    productVariantId,
    type,
  }, tx = prisma) {
    return tx.inventoryTransaction.count({
      where: {
        ...(type && { type }),

        ...(productVariantId && {
          inventory: {
            productVariantId,
          },
        }),
      },
    });
  }
}

export default new InventoryTransactionRepository();