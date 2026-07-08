import prisma from "../../config/prisma.js";

class CartItemRepository {
  async create(data, tx = prisma) {
    return tx.cartItem.create({
      data,
    });
  }

  async findById(id, tx = prisma) {
    return tx.cartItem.findUnique({
      where: {
        id,
      },
      include: {
        productVariant: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findByCartAndVariant(cartId, productVariantId, tx = prisma) {
    return tx.cartItem.findUnique({
      where: {
        cartId_productVariantId: {
          cartId,
          productVariantId,
        },
      },
    });
  }

  async findManyByCartId(cartId, tx = prisma) {
    return tx.cartItem.findMany({
      where: {
        cartId,
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
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async update(id, data, tx = prisma) {
    return tx.cartItem.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id, tx = prisma) {
    return tx.cartItem.delete({
      where: {
        id,
      },
    });
  }

  async deleteManyByCartId(cartId, tx = prisma) {
    return tx.cartItem.deleteMany({
      where: {
        cartId,
      },
    });
  }
}

export default new CartItemRepository();