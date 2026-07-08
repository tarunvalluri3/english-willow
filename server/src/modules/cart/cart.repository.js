import prisma from "../../config/prisma.js";

class CartRepository {
  async create(data, tx = prisma) {
    return tx.cart.create({
      data,
    });
  }

  async findByUserId(userId, tx = prisma) {
    return tx.cart.findUnique({
      where: {
        userId,
      },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: true,
                images: {
                  where: {
                    isPrimary: true,
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });
  }

  async delete(id, tx = prisma) {
    return tx.cart.delete({
      where: {
        id,
      },
    });
  }
}

export default new CartRepository();