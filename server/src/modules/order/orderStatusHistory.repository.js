import prisma from "../../config/prisma.js";

class OrderStatusHistoryRepository {
  async create(data, tx = prisma) {
    return tx.orderStatusHistory.create({
      data,
    });
  }

  async createMany(data, tx = prisma) {
    return tx.orderStatusHistory.createMany({
      data,
    });
  }

  async findById(id, tx = prisma) {
    return tx.orderStatusHistory.findUnique({
      where: {
        id,
      },
      include: {
        order: true,

        createdBy: true,
      },
    });
  }

  async findManyByOrderId(orderId, tx = prisma) {
    return tx.orderStatusHistory.findMany({
      where: {
        orderId,
      },

      include: {
        createdBy: true,
      },

      orderBy: {
        createdAt: "asc",
      },
    });
  }
}

export default new OrderStatusHistoryRepository();