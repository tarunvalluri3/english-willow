import prisma from "../../config/prisma.js";

class AddressRepository {
  async create(data, tx = prisma) {
    return tx.address.create({
      data,
    });
  }

  async findById(id, tx = prisma) {
    return tx.address.findUnique({
      where: {
        id,
      },
    });
  }

  async findByUserId(userId, options = {}, tx = prisma) {
    return tx.address.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      ...(options.skip !== undefined && { skip: options.skip }),
      ...(options.take !== undefined && { take: options.take }),
    });
  }

  async countByUserId(userId, tx = prisma) {
    return tx.address.count({ where: { userId } });
  }

  async findByIdAndUser(id, userId, tx = prisma) {
    return tx.address.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async update(id, data, tx = prisma) {
    return tx.address.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id, tx = prisma) {
    return tx.address.delete({
      where: {
        id,
      },
    });
  }
}

export default new AddressRepository();
