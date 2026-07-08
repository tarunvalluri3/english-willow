import prisma from "../../config/prisma.js";

class ProductRepository {
  async create(data) {
    return prisma.product.create({
      data,
    });
  }

  async findById(id) {
    return prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findByProductCode(productCode) {
    return prisma.product.findFirst({
      where: {
        productCode,
        deletedAt: null,
      },
    });
  }

  async findByProductCodeExceptId(productCode, id) {
    return prisma.product.findFirst({
      where: {
        productCode,
        deletedAt: null,
        NOT: {
          id,
        },
      },
    });
  }

  async findByName(name) {
    return prisma.product.findFirst({
      where: {
        name,
        deletedAt: null,
      },
    });
  }

  async findByNameExceptId(name, id) {
    return prisma.product.findFirst({
      where: {
        name,
        deletedAt: null,
        NOT: {
          id,
        },
      },
    });
  }

  async findBySlug(slug) {
    return prisma.product.findUnique({
      where: {
        slug,
      },
    });
  }

  async findMany({
    skip,
    take,
    search,
    categoryId,
    status,
    featured,
  }) {
    return prisma.product.findMany({
      where: {
        deletedAt: null,

        ...(search && {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              productCode: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }),

        ...(categoryId && { categoryId }),

        ...(status && { status }),

        ...(featured !== undefined && {
          isFeatured: featured,
        }),
      },

      include: {
        category: true,
      },

      skip,

      take,

      orderBy: [
        {
          isFeatured: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });
  }

  async count({
    search,
    categoryId,
    status,
    featured,
  }) {
    return prisma.product.count({
      where: {
        deletedAt: null,

        ...(search && {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              productCode: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }),

        ...(categoryId && { categoryId }),

        ...(status && { status }),

        ...(featured !== undefined && {
          isFeatured: featured,
        }),
      },
    });
  }

  async update(id, data) {
    return prisma.product.update({
      where: {
        id,
      },
      data,
    });
  }

  async softDelete(id) {
    return prisma.product.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

export default new ProductRepository();