import prisma from "../../config/prisma.js";

class CategoryRepository {
  async create(data) {
    return prisma.category.create({
      data,
    });
  }

  async findById(id) {
    return prisma.category.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findByName(name) {
    return prisma.category.findFirst({
      where: {
        name,
        deletedAt: null,
      },
    });
  }

  async findBySlug(slug) {
    return prisma.category.findUnique({
      where: {
        slug,
      },
    });
  }

  async findByParentId(parentId) {
    return prisma.category.findMany({
      where: {
        parentId,
        deletedAt: null,
      },
      orderBy: {
        displayOrder: "asc",
      },
    });
  }

  async findMany({ skip, take, search }) {
    return prisma.category.findMany({
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
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }),
      },

      skip,

      take,

      orderBy: [
        {
          displayOrder: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });
  }

  async count(search) {
    return prisma.category.count({
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
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }),
      },
    });
  }

  async update(id, data) {
    return prisma.category.update({
      where: {
        id,
      },
      data,
    });
  }

  async softDelete(id) {
    return prisma.category.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

export default new CategoryRepository();