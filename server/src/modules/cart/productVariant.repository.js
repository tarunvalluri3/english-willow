import prisma from "../../config/prisma.js";

class ProductVariantRepository {
  async findById(id, tx = prisma) {
    return tx.productVariant.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        product: true,
        inventory: true,
        images: {
          where: {
            isPrimary: true,
          },
          take: 1,
        },
        attributeValues: {
          include: {
            attribute: true,
            attributeValue: true,
          },
        },
      },
    });
  }

  async findBySku(sku, tx = prisma) {
    return tx.productVariant.findFirst({
      where: {
        sku,
        deletedAt: null,
      },
    });
  }

  async update(id, data, tx = prisma) {
    return tx.productVariant.update({
      where: {
        id,
      },
      data,
    });
  }
}

export default new ProductVariantRepository();