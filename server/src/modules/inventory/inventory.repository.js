import prisma from "../../config/prisma.js";

class InventoryRepository {
  async create(data, tx = prisma) {
    return tx.inventory.create({
      data,
    });
  }

  async findByProductVariantId(productVariantId, tx = prisma) {
    return tx.inventory.findUnique({
      where: {
        productVariantId,
      },
      include: {
        productVariant: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findMany({ skip, take, search, lowStock }, tx = prisma) {
    return tx.inventory.findMany({
      where: {
        ...(lowStock && {
          quantityAvailable: {
            lte: prisma.inventory.fields.lowStockThreshold,
          },
        }),

        ...(search && {
          productVariant: {
            product: {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  productCode: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            },
          },
        }),
      },

      include: {
        productVariant: {
          include: {
            product: true,
          },
        },
      },

      skip,
      take,

      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async count({ search, lowStock }, tx = prisma) {
    return tx.inventory.count({
      where: {
        ...(lowStock && {
          quantityAvailable: {
            lte: prisma.inventory.fields.lowStockThreshold,
          },
        }),

        ...(search && {
          productVariant: {
            product: {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  productCode: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            },
          },
        }),
      },
    });
  }

  async update(id, data, tx = prisma) {
    return tx.inventory.update({
      where: {
        id,
      },
      data,
    });
  }
}

export default new InventoryRepository();
