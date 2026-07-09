import prisma from "../../config/prisma.js";

class ReviewRepository {
  async create(data, tx = prisma) {
    return tx.review.create({
      data,
    });
  }

  async findById(id, tx = prisma) {
    return tx.review.findUnique({
      where: {
        id,
      },
      include: {
        user: true,

        product: true,

        orderItem: {
          include: {
            order: true,

            productVariant: true,
          },
        },
      },
    });
  }

  async findByOrderItemId(orderItemId, tx = prisma) {
    return tx.review.findUnique({
      where: {
        orderItemId,
      },
    });
  }

  async findMany(filters, tx = prisma) {
    return tx.review.findMany({
      where: {
        ...(filters.productId && {
          productId: filters.productId,
        }),

        ...(filters.rating && {
          rating: filters.rating,
        }),

        ...(filters.status && {
          status: filters.status,
        }),
      },

      include: {
        user: true,

        product: true,
      },

      skip: filters.skip,

      take: filters.take,

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async count(filters, tx = prisma) {
    return tx.review.count({
      where: {
        ...(filters.productId && {
          productId: filters.productId,
        }),

        ...(filters.rating && {
          rating: filters.rating,
        }),

        ...(filters.status && {
          status: filters.status,
        }),
      },
    });
  }

  async update(id, data, tx = prisma) {
    return tx.review.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id, tx = prisma) {
    return tx.review.delete({
      where: {
        id,
      },
    });
  }
}

export default new ReviewRepository();