import prisma from "../../config/prisma.js";

class WishlistRepository {
  async create(data, tx = prisma) {
    return tx.wishlist.create({
      data,
    });
  }

  async findById(id, tx = prisma) {
    return tx.wishlist.findUnique({
      where: {
        id,
      },
      include: {
        product: {
          include: {
            category: true,
            variants: {
              include: {
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

  async findByUserAndProduct(userId, productId, tx = prisma) {
    return tx.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }

  async findManyByUserId(userId, tx = prisma) {
    return tx.wishlist.findMany({
      where: {
        userId,
      },
      include: {
        product: {
          include: {
            category: true,
            variants: {
              include: {
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
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async delete(id, tx = prisma) {
    return tx.wishlist.delete({
      where: {
        id,
      },
    });
  }

  async deleteManyByUserId(userId, tx = prisma) {
    return tx.wishlist.deleteMany({
      where: {
        userId,
      },
    });
  }
}

export default new WishlistRepository();
