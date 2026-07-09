import prisma from "../../config/prisma.js";

class PaymentRepository {
  async create(data, tx = prisma) {
    return tx.payment.create({
      data,
    });
  }

  async findById(id, tx = prisma) {
    return tx.payment.findUnique({
      where: {
        id,
      },
      include: {
        order: {
          include: {
            user: true,
            orderItems: true,
          },
        },
      },
    });
  }

  async findByOrderId(orderId, tx = prisma) {
    return tx.payment.findUnique({
      where: {
        orderId,
      },
      include: {
        order: true,
      },
    });
  }

  async findMany(filters, tx = prisma) {
    return tx.payment.findMany({
      where: {
        ...(filters.status && {
          status: filters.status,
        }),

        ...(filters.paymentMethod && {
          paymentMethod: filters.paymentMethod,
        }),
      },

      include: {
        order: {
          include: {
            user: true,
          },
        },
      },

      skip: filters.skip,
      take: filters.take,

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async count(filters, tx = prisma) {
    return tx.payment.count({
      where: {
        ...(filters.status && {
          status: filters.status,
        }),

        ...(filters.paymentMethod && {
          paymentMethod: filters.paymentMethod,
        }),
      },
    });
  }

  async update(id, data, tx = prisma) {
    return tx.payment.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id, tx = prisma) {
    return tx.payment.delete({
      where: {
        id,
      },
    });
  }
}

export default new PaymentRepository();