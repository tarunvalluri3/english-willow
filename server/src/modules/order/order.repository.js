import prisma from "../../config/prisma.js";

class OrderRepository {
  async create(data, tx = prisma) {
    return tx.order.create({
      data,
    });
  }

  async findById(id, tx = prisma) {
    return tx.order.findUnique({
      where: {
        id,
      },
      include: {
        user: true,

        address: true,

        orderItems: {
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

        payment: true,

        statusHistory: {
          include: {
            createdBy: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
  }

  async findByOrderNumber(orderNumber, tx = prisma) {
    return tx.order.findUnique({
      where: {
        orderNumber,
      },
    });
  }

  async findMany(
    {
      skip,
      take,
      userId,
      status,
    },
    tx = prisma
  ) {
    return tx.order.findMany({
      where: {
        ...(userId && { userId }),

        ...(status && { status }),
      },

      include: {
        orderItems: true,

        payment: true,
      },

      skip,

      take,

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async count(
    {
      userId,
      status,
    },
    tx = prisma
  ) {
    return tx.order.count({
      where: {
        ...(userId && { userId }),

        ...(status && { status }),
      },
    });
  }

  async update(id, data, tx = prisma) {
    return tx.order.update({
      where: {
        id,
      },
      data,
    });
  }
}

export default new OrderRepository();