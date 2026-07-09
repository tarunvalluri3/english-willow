import prisma from "../../config/prisma.js";

class CouponRepository {
  async create(data, tx = prisma) {
    return tx.coupon.create({
      data,
    });
  }

  async findById(id, tx = prisma) {
    return tx.coupon.findUnique({
      where: {
        id,
      },
    });
  }

  async findByCode(code, tx = prisma) {
    return tx.coupon.findUnique({
      where: {
        code,
      },
    });
  }

  async findMany(filters, tx = prisma) {
    return tx.coupon.findMany({
      where: {
        ...(filters.status && {
          status: filters.status,
        }),
      },

      skip: filters.skip,

      take: filters.take,

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async count(filters, tx = prisma) {
    return tx.coupon.count({
      where: {
        ...(filters.status && {
          status: filters.status,
        }),
      },
    });
  }

  async update(id, data, tx = prisma) {
    return tx.coupon.update({
      where: {
        id,
      },
      data,
    });
  }

  async incrementUsage(id, tx = prisma) {
    return tx.coupon.update({
      where: {
        id,
      },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });
  }

  async delete(id, tx = prisma) {
    return tx.coupon.delete({
      where: {
        id,
      },
    });
  }
}

export default new CouponRepository();