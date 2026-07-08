import prisma from "../../config/prisma.js";

class OrderItemRepository {
  async create(data, tx = prisma) {
    return tx.orderItem.create({
      data,
    });
  }

  async createMany(data, tx = prisma) {
    return tx.orderItem.createMany({
      data,
    });
  }

  async findById(id, tx = prisma) {
    return tx.orderItem.findUnique({
      where: {
        id,
      },
      include: {
        order: true,

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

        review: true,
      },
    });
  }

  async findManyByOrderId(orderId, tx = prisma) {
    return tx.orderItem.findMany({
      where: {
        orderId,
      },

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

        review: true,
      },

      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async delete(id, tx = prisma) {
    return tx.orderItem.delete({
      where: {
        id,
      },
    });
  }

  async deleteManyByOrderId(orderId, tx = prisma) {
    return tx.orderItem.deleteMany({
      where: {
        orderId,
      },
    });
  }
}

export default new OrderItemRepository();