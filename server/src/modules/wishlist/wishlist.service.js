import prisma from "../../config/prisma.js";
import ApiError from "../../common/ApiError.js";

import wishlistRepository from "./wishlist.repository.js";
import productRepository from "../product/product.repository.js";

class WishlistService {
  async getWishlist(userId) {
    return await wishlistRepository.findManyByUserId(userId);
  }

  async addItem(userId, data) {
    return prisma.$transaction(async (tx) => {
      const product = await productRepository.findById(
        data.productId,
        tx
      );

      if (!product) {
        throw new ApiError(404, "Product not found.");
      }

      const existingItem =
        await wishlistRepository.findByUserAndProduct(
          userId,
          data.productId,
          tx
        );

      if (existingItem) {
        throw new ApiError(
          409,
          "Product already exists in your wishlist."
        );
      }

      await wishlistRepository.create(
        {
          userId,
          productId: data.productId,
        },
        tx
      );

      return wishlistRepository.findManyByUserId(userId, tx);
    });
  }

  async removeItem(userId, wishlistItemId) {
    return prisma.$transaction(async (tx) => {
      const wishlistItem =
        await wishlistRepository.findById(
          wishlistItemId,
          tx
        );

      if (!wishlistItem) {
        throw new ApiError(404, "Wishlist item not found.");
      }

      if (wishlistItem.userId !== userId) {
        throw new ApiError(
          403,
          "You are not authorized to access this wishlist item."
        );
      }

      await wishlistRepository.delete(
        wishlistItemId,
        tx
      );

      return wishlistRepository.findManyByUserId(
        userId,
        tx
      );
    });
  }

  async clearWishlist(userId) {
    return prisma.$transaction(async (tx) => {
      await wishlistRepository.deleteManyByUserId(
        userId,
        tx
      );

      return [];
    });
  }
}

export default new WishlistService();
