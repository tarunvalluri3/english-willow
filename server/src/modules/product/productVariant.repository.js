import prisma from "../../config/prisma.js";

class ProductVariantRepository {
  async findActiveById(id, tx = prisma) {
    return tx.productVariant.findFirst({
      where: {
        id,
        status: "ACTIVE",
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

        attributeValues: true,
      },
    });
  }
}

export default new ProductVariantRepository();