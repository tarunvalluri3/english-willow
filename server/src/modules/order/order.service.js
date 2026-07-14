import prisma from "../../config/prisma.js";

import ApiError from "../../common/ApiError.js";

import { getPagination, getPaginationMeta } from "../../common/pagination.js";

import getNextOrderNumber from "../../common/getNextOrderNumber.js";

import orderRepository from "./order.repository.js";
import orderItemRepository from "./orderItem.repository.js";
import orderStatusHistoryRepository from "./orderStatusHistory.repository.js";

import cartRepository from "../cart/cart.repository.js";
import cartItemRepository from "../cart/cartItem.repository.js";

import addressRepository from "../address/address.repository.js";

import productVariantRepository from "../product/productVariant.repository.js";

import inventoryRepository from "../inventory/inventory.repository.js";
import inventoryTransactionRepository from "../inventory/inventoryTransaction.repository.js";
import couponService from "../coupon/coupon.service.js";

class OrderService {
  async getOrders(userId, query) {
    const { page, limit, skip } = getPagination(query);

    const filters = {
      skip,
      take: limit,
      userId,
      status: query.status,
    };

    const [orders, totalItems] = await Promise.all([
      orderRepository.findMany(filters),
      orderRepository.count(filters),
    ]);

    return {
      orders,
      meta: getPaginationMeta(page, limit, totalItems),
    };
  }

  async getOrderById(userId, orderId) {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw new ApiError(404, "Order not found.");
    }

    // Ownership check
    if (order.userId !== userId) {
      throw new ApiError(403, "You are not authorized to access this order.");
    }

    return order;
  }

  async createOrder(userId, data) {
    return prisma.$transaction(async (tx) => {
      /*
    |--------------------------------------------------------------------------
    | Validate Cart
    |--------------------------------------------------------------------------
    */

      const { cart, selectedItems } = await this._validateCart(userId, tx);

      /*
    |--------------------------------------------------------------------------
    | Shipping Snapshot
    |--------------------------------------------------------------------------
    */

      const shippingSnapshot = await this._createShippingSnapshot(
        userId,
        data.addressId,
        tx,
      );

      /*
    |--------------------------------------------------------------------------
    | Calculate Totals
    |--------------------------------------------------------------------------
    */

      const baseTotals = this._calculateOrderTotals(selectedItems);

      const couponApplication = data.couponCode
        ? await couponService.applyCoupon(
            {
              code: data.couponCode,
              // Always calculate the eligible amount from server-side cart data.
              orderAmount: baseTotals.subtotal,
            },
            tx,
          )
        : null;

      const totals = this._calculateOrderTotals(
        selectedItems,
        couponApplication?.discount ?? 0,
      );

      /*
    |--------------------------------------------------------------------------
    | Generate Order Number
    |--------------------------------------------------------------------------
    */

      const orderNumber = await getNextOrderNumber(tx);

      /*
    |--------------------------------------------------------------------------
    | Create Order
    |--------------------------------------------------------------------------
    */

      const order = await orderRepository.create(
        {
          orderNumber,

          userId,

          ...shippingSnapshot,

          ...totals,

          couponCode: couponApplication?.coupon.code ?? null,

          notes: data.notes,
        },
        tx,
      );

      /*
    |--------------------------------------------------------------------------
    | Create Order Items
    |--------------------------------------------------------------------------
    */

      await this._createOrderItems(order.id, selectedItems, tx);

      /*
    |--------------------------------------------------------------------------
    | Reserve Inventory
    |--------------------------------------------------------------------------
    */

      await this._reserveInventory(selectedItems, userId, tx, order.id);

      /*
    |--------------------------------------------------------------------------
    | Create Initial Status History
    |--------------------------------------------------------------------------
    */

      await this._createInitialStatusHistory(order.id, userId, tx);

      /*
    |--------------------------------------------------------------------------
    | Remove Purchased Items From Cart
    |--------------------------------------------------------------------------
    */

      await cartItemRepository.deleteManyByIds(
        selectedItems.map((item) => item.id),
        tx,
      );

      if (couponApplication) {
        await couponService.incrementCouponUsage(
          couponApplication.coupon.id,
          tx,
        );
      }

      /*
    |--------------------------------------------------------------------------
    | Return Complete Order
    |--------------------------------------------------------------------------
    */

      return orderRepository.findById(order.id, tx);
    });
  }

  async updateOrderStatus(orderId, status, notes, adminUserId) {
    return prisma.$transaction(async (tx) => {
      /*
    |--------------------------------------------------------------------------
    | Find Order
    |--------------------------------------------------------------------------
    */

      const order = await orderRepository.findById(orderId, tx);

      if (!order) {
        throw new ApiError(404, "Order not found.");
      }

      /*
    |--------------------------------------------------------------------------
    | Prevent Invalid Status Changes
    |--------------------------------------------------------------------------
    */

      if (order.status === status) {
        throw new ApiError(400, `Order is already ${status.toLowerCase()}.`);
      }

      if (order.status === "DELIVERED" || order.status === "RETURNED") {
        throw new ApiError(400, "Order status can no longer be updated.");
      }

      /*
    |--------------------------------------------------------------------------
    | Update Order Status
    |--------------------------------------------------------------------------
    */

      await orderRepository.update(
        order.id,
        {
          status,
        },
        tx,
      );

      /*
    |--------------------------------------------------------------------------
    | Create Status History
    |--------------------------------------------------------------------------
    */

      await orderStatusHistoryRepository.create(
        {
          orderId: order.id,

          status,

          notes: notes || `Order status updated to ${status}.`,

          createdByUserId: adminUserId,
        },
        tx,
      );

      /*
    |--------------------------------------------------------------------------
    | Return Updated Order
    |--------------------------------------------------------------------------
    */

      return orderRepository.findById(order.id, tx);
    });
  }

  async cancelOrder(userId, orderId, data) {
    return prisma.$transaction(async (tx) => {
      /*
    |--------------------------------------------------------------------------
    | Find Order
    |--------------------------------------------------------------------------
    */

      const order = await orderRepository.findById(orderId, tx);

      if (!order) {
        throw new ApiError(404, "Order not found.");
      }

      /*
    |--------------------------------------------------------------------------
    | Ownership Check
    |--------------------------------------------------------------------------
    */

      if (order.userId !== userId) {
        throw new ApiError(403, "You are not authorized to cancel this order.");
      }

      /*
    |--------------------------------------------------------------------------
    | Validate Order Status
    |--------------------------------------------------------------------------
    */

      if (order.status === "CANCELLED") {
        throw new ApiError(400, "Order is already cancelled.");
      }

      if (order.status === "DELIVERED") {
        throw new ApiError(400, "Delivered orders cannot be cancelled.");
      }

      if (order.status === "RETURNED") {
        throw new ApiError(400, "Returned orders cannot be cancelled.");
      }

      /*
    |--------------------------------------------------------------------------
    | Restore Inventory
    |--------------------------------------------------------------------------
    */

      for (const item of order.orderItems) {
        const inventory = await inventoryRepository.findByProductVariantId(
          item.productVariantId,
          tx,
        );

        if (!inventory) {
          throw new ApiError(404, `Inventory not found for SKU ${item.sku}.`);
        }

        await inventoryRepository.update(
          inventory.id,
          {
            quantityAvailable: inventory.quantityAvailable + item.quantity,

            lastStockUpdatedAt: new Date(),
          },
          tx,
        );

        await inventoryTransactionRepository.create(
          {
            inventoryId: inventory.id,

            type: "CANCELLATION",

            quantity: item.quantity,

            reason: "Customer cancelled the order.",

            referenceId: order.id,

            createdByUserId: userId,
          },
          tx,
        );
      }

      /*
    |--------------------------------------------------------------------------
    | Update Order Status
    |--------------------------------------------------------------------------
    */

      await orderRepository.update(
        order.id,
        {
          status: "CANCELLED",
        },
        tx,
      );

      /*
    |--------------------------------------------------------------------------
    | Status History
    |--------------------------------------------------------------------------
    */

      await orderStatusHistoryRepository.create(
        {
          orderId: order.id,

          status: "CANCELLED",

          notes: data.notes || "Order cancelled by customer.",

          createdByUserId: userId,
        },
        tx,
      );

      /*
    |--------------------------------------------------------------------------
    | Return Updated Order
    |--------------------------------------------------------------------------
    */

      return orderRepository.findById(order.id, tx);
    });
  }

  _calculateOrderTotals(cartItems, discountAmount = 0) {
    const subtotal = cartItems.reduce((total, item) => {
      return total + Number(item.unitPrice) * item.quantity;
    }, 0);

    const appliedDiscount = Math.min(Number(discountAmount), subtotal);

    // Future modules
    const shippingAmount = 0;
    const taxAmount = 0;

    const totalAmount = subtotal - appliedDiscount + shippingAmount + taxAmount;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      discountAmount: Number(appliedDiscount.toFixed(2)),
      shippingAmount: Number(shippingAmount.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
    };
  }

  async _createShippingSnapshot(userId, addressId, tx) {
    const address = await addressRepository.findByIdAndUser(
      addressId,
      userId,
      tx,
    );

    if (!address) {
      throw new ApiError(404, "Shipping address not found.");
    }

    return {
      addressId: address.id,

      shippingFullName: address.fullName,
      shippingPhone: address.phone,

      shippingAddressLine1: address.addressLine1,
      shippingAddressLine2: address.addressLine2,

      shippingLandmark: address.landmark,

      shippingCity: address.city,
      shippingState: address.state,

      shippingPostalCode: address.postalCode,

      shippingCountry: address.country,
    };
  }

  async _validateCart(userId, tx) {
    const cart = await cartRepository.findByUserId(userId, tx);

    if (!cart) {
      throw new ApiError(404, "Cart not found.");
    }

    const selectedItems = cart.items.filter((item) => item.isSelected);

    if (selectedItems.length === 0) {
      throw new ApiError(400, "Your cart does not contain any selected items.");
    }

    for (const item of selectedItems) {
      const variant = await productVariantRepository.findActiveById(
        item.productVariantId,
        tx,
      );

      if (!variant) {
        throw new ApiError(
          404,
          `Product variant not found for cart item ${item.id}.`,
        );
      }

      if (!variant.inventory) {
        throw new ApiError(
          400,
          `Inventory is not configured for product ${variant.sku}.`,
        );
      }

      if (variant.inventory.quantityAvailable < item.quantity) {
        throw new ApiError(400, `Insufficient stock for SKU ${variant.sku}.`);
      }
    }

    return {
      cart,
      selectedItems,
    };
  }

  async _reserveInventory(cartItems, userId, tx, referenceId) {
    for (const item of cartItems) {
      const inventory = await inventoryRepository.findByProductVariantId(
        item.productVariantId,
        tx,
      );

      if (!inventory) {
        throw new ApiError(
          404,
          `Inventory not found for product variant ${item.productVariantId}.`,
        );
      }

      if (inventory.quantityAvailable < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient inventory for SKU ${item.productVariant.sku}.`,
        );
      }

      await inventoryRepository.update(
        inventory.id,
        {
          quantityAvailable: inventory.quantityAvailable - item.quantity,
          lastStockUpdatedAt: new Date(),
        },
        tx,
      );

      await inventoryTransactionRepository.create(
        {
          inventoryId: inventory.id,

          type: "ORDER",

          quantity: item.quantity,

          reason: "Customer order placed.",

          referenceId,

          createdByUserId: userId,
        },
        tx,
      );
    }
  }

  async _createOrderItems(orderId, cartItems, tx) {
    const orderItems = cartItems.map((item) => ({
      orderId,

      productVariantId: item.productVariantId,

      productName: item.productVariant.product.name,

      sku: item.productVariant.sku,

      quantity: item.quantity,

      unitPrice: item.unitPrice,

      subtotal: Number(item.unitPrice) * item.quantity,
    }));

    await orderItemRepository.createMany(orderItems, tx);
  }

  async _createInitialStatusHistory(orderId, createdByUserId, tx) {
    return orderStatusHistoryRepository.create(
      {
        orderId,

        status: "PENDING",

        notes: "Order placed successfully.",

        createdByUserId,
      },
      tx,
    );
  }
}

export default new OrderService();
