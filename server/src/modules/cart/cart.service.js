import prisma from "../../config/prisma.js";

import ApiError from "../../common/ApiError.js";

import cartRepository from "./cart.repository.js";
import cartItemRepository from "./cartItem.repository.js";

import productVariantRepository from "../product/productVariant.repository.js";
import inventoryRepository from "../inventory/inventory.repository.js";

class CartService {
  async getCart(userId) {
    const cart = await cartRepository.findByUserId(userId);

    if (!cart) {
      return {
        items: [],
        summary: {
          totalItems: 0,
          subtotal: 0,
        },
      };
    }

    const summary = this.calculateTotals(cart.items);

    return {
      ...cart,
      summary,
    };
  }

  async addItem(userId, data) {
    return prisma.$transaction(async (tx) => {
      // Find the product variant
      const productVariant = await productVariantRepository.findActiveById(
        data.productVariantId,
        tx,
      );

      if (!productVariant) {
        throw new ApiError(404, "Product variant not found.");
      }

      // Ensure inventory exists
      if (!productVariant.inventory) {
        throw new ApiError(
          400,
          "Inventory is not configured for this product variant.",
        );
      }

      // Ensure requested quantity is available
      if (productVariant.inventory.quantityAvailable < data.quantity) {
        throw new ApiError(
          400,
          "Requested quantity is not available in inventory.",
        );
      }

      // Find or create cart
      let cart = await cartRepository.findByUserId(userId, tx);

      if (!cart) {
        cart = await cartRepository.create(
          {
            userId,
          },
          tx,
        );
      }

      // Check if the variant already exists in the cart
      const existingItem = await cartItemRepository.findByCartAndVariant(
        cart.id,
        data.productVariantId,
        tx,
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + data.quantity;

        if (newQuantity > productVariant.inventory.quantityAvailable) {
          throw new ApiError(
            400,
            "Requested quantity exceeds available inventory.",
          );
        }

        await cartItemRepository.update(
          existingItem.id,
          {
            quantity: newQuantity,
          },
          tx,
        );
      } else {
        await cartItemRepository.create(
          {
            cartId: cart.id,
            productVariantId: data.productVariantId,
            quantity: data.quantity,
            unitPrice: productVariant.price,
          },
          tx,
        );
      }

      const updatedCart = await cartRepository.findByUserId(userId, tx);

      return {
        ...updatedCart,
        summary: this.calculateTotals(updatedCart.items),
      };
    });
  }

  async updateItem(userId, itemId, data) {
    return prisma.$transaction(async (tx) => {
      // Find user's cart
      const cart = await cartRepository.findByUserId(userId, tx);

      if (!cart) {
        throw new ApiError(404, "Cart not found.");
      }

      // Find cart item
      const cartItem = await cartItemRepository.findById(itemId, tx);

      if (!cartItem) {
        throw new ApiError(404, "Cart item not found.");
      }

      // Ensure the item belongs to the user's cart
      if (cartItem.cartId !== cart.id) {
        throw new ApiError(
          403,
          "You are not authorized to access this cart item.",
        );
      }

      // Find inventory
      const inventory = await inventoryRepository.findByProductVariantId(
        cartItem.productVariantId,
        tx,
      );

      if (!inventory) {
        throw new ApiError(404, "Inventory not found.");
      }

      // Check stock availability
      if (data.quantity > inventory.quantityAvailable) {
        throw new ApiError(
          400,
          "Requested quantity exceeds available inventory.",
        );
      }

      // Update quantity
      await cartItemRepository.update(
        itemId,
        {
          quantity: data.quantity,
        },
        tx,
      );

      // Return updated cart
      const updatedCart = await cartRepository.findByUserId(userId, tx);

      return {
        ...updatedCart,
        summary: this.calculateTotals(updatedCart.items),
      };
    });
  }

  async removeItem(userId, itemId) {
    return prisma.$transaction(async (tx) => {
      // Find user's cart
      const cart = await cartRepository.findByUserId(userId, tx);

      if (!cart) {
        throw new ApiError(404, "Cart not found.");
      }

      // Find cart item
      const cartItem = await cartItemRepository.findById(itemId, tx);

      if (!cartItem) {
        throw new ApiError(404, "Cart item not found.");
      }

      // Ensure the item belongs to the user's cart
      if (cartItem.cartId !== cart.id) {
        throw new ApiError(
          403,
          "You are not authorized to access this cart item.",
        );
      }

      // Remove the item
      await cartItemRepository.delete(itemId, tx);

      // Return updated cart
      const updatedCart = await cartRepository.findByUserId(userId, tx);

      return {
        ...updatedCart,
        summary: this.calculateTotals(updatedCart.items),
      };
    });
  }

  async clearCart(userId) {
    return prisma.$transaction(async (tx) => {
      // Find user's cart
      const cart = await cartRepository.findByUserId(userId, tx);

      if (!cart) {
        return {
          items: [],
          summary: {
            totalItems: 0,
            subtotal: 0,
          },
        };
      }

      // Delete all cart items
      await cartItemRepository.deleteManyByCartId(cart.id, tx);

      // Return empty cart
      return {
        ...cart,
        items: [],
        summary: {
          totalItems: 0,
          subtotal: 0,
        },
      };
    });
  }

  calculateTotals(items) {
    const summary = items.reduce(
      (acc, item) => {
        const unitPrice = Number(item.unitPrice);
        const lineTotal = unitPrice * item.quantity;

        acc.totalItems += item.quantity;
        acc.subtotal += lineTotal;

        return acc;
      },
      {
        totalItems: 0,
        subtotal: 0,
      },
    );

    return {
      totalItems: summary.totalItems,
      subtotal: Number(summary.subtotal.toFixed(2)),
    };
  }
} 

export default new CartService();
