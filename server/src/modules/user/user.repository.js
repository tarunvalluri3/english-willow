import prisma from "../../config/prisma.js";

class UserRepository {
  async findById(id, tx = prisma) {
    return tx.user.findUnique({
      where: {
        id,
      },
      include: {
        addresses: true,
        orders: true,
        reviews: true,
      },
    });
  }

  async findMany(filters, tx = prisma) {
    return tx.user.findMany({
      where: {
        ...(filters.role && {
          role: filters.role,
        }),

        ...(filters.status && {
          status: filters.status,
        }),

        ...(filters.search && {
          OR: [
            {
              firstName: {
                contains: filters.search,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: filters.search,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: filters.search,
                mode: "insensitive",
              },
            },
          ],
        }),
      },

      include: {
        addresses: true,
      },

      skip: filters.skip,

      take: filters.take,

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async count(filters, tx = prisma) {
    return tx.user.count({
      where: {
        ...(filters.role && {
          role: filters.role,
        }),

        ...(filters.status && {
          status: filters.status,
        }),

        ...(filters.search && {
          OR: [
            {
              firstName: {
                contains: filters.search,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: filters.search,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: filters.search,
                mode: "insensitive",
              },
            },
          ],
        }),
      },
    });
  }

  async update(id, data, tx = prisma) {
    return tx.user.update({
      where: {
        id,
      },
      data,
    });
  }

  async softDelete(id, tx = prisma) {
    return tx.user.update({
      where: {
        id,
      },
      data: {
        status: "INACTIVE",
        deletedAt: new Date(),
      },
    });
  }
}

export default new UserRepository();