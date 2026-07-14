import crypto from "crypto";

import prisma from "../../config/prisma.js";
import razorpay from "../../config/razorpay.js";

import ApiError from "../../common/ApiError.js";
import { getPagination, getPaginationMeta } from "../../common/pagination.js";

import paymentRepository from "./payment.repository.js";
import orderRepository from "../order/order.repository.js";

class PaymentService {
  async getPayments(query) {
    const { page, limit, skip } = getPagination(query);

    const filters = {
      skip,
      take: limit,
      status: query.status,
      paymentMethod: query.paymentMethod,
    };

    const [payments, totalItems] = await Promise.all([
      paymentRepository.findMany(filters),
      paymentRepository.count(filters),
    ]);

    return {
      payments,
      meta: getPaginationMeta(page, limit, totalItems),
    };
  }

  async getPaymentById(id, currentUser) {
    const payment = await paymentRepository.findById(id);

    if (!payment) {
      throw new ApiError(404, "Payment not found.");
    }

    if (
      currentUser.role === "CUSTOMER" &&
      payment.order.userId !== currentUser.id
    ) {
      throw new ApiError(403, "You are not authorized to access this payment.");
    }

    return payment;
  }

  async createPayment(userId, data) {
    return prisma.$transaction(async (tx) => {
      const order = await orderRepository.findById(data.orderId, tx);

      if (!order) {
        throw new ApiError(404, "Order not found.");
      }

      if (order.userId !== userId) {
        throw new ApiError(
          403,
          "You are not authorized to pay for this order.",
        );
      }

      if (["CANCELLED", "RETURNED", "REFUNDED"].includes(order.status)) {
        throw new ApiError(400, "Payment cannot be created for this order.");
      }

      const existingPayment = await paymentRepository.findByOrderId(
        order.id,
        tx,
      );

      if (existingPayment) {
        throw new ApiError(400, "Payment already exists for this order.");
      }

      const payment = await paymentRepository.create(
        {
          orderId: order.id,
          paymentMethod: data.paymentMethod,
          amount: order.totalAmount,
          paymentGateway: data.paymentMethod === "COD" ? "COD" : "RAZORPAY",
        },
        tx,
      );

      if (data.paymentMethod === "COD") {
        await this._confirmReservedInventory(order.orderItems, tx);
        await orderRepository.update(
          order.id,
          {
            status: "CONFIRMED",
          },
          tx,
        );
      }

      return paymentRepository.findById(payment.id, tx);
    });
  }

  async verifyPayment(userId, data) {
    return prisma.$transaction(async (tx) => {
      const payment = await paymentRepository.findById(data.paymentId, tx);

      if (!payment) {
        throw new ApiError(404, "Payment not found.");
      }

      if (payment.order.userId !== userId) {
        throw new ApiError(
          403,
          "You are not authorized to verify this payment.",
        );
      }

      if (payment.paymentMethod === "COD") {
        throw new ApiError(
          400,
          "COD payments do not require online verification.",
        );
      }

      if (payment.status === "PAID") {
        throw new ApiError(400, "Payment has already been verified.");
      }

      if (!payment.gatewayOrderId) {
        throw new ApiError(400, "Razorpay order has not been created.");
      }

      if (payment.gatewayOrderId !== data.paymentGatewayOrderId) {
        throw new ApiError(400, "Payment gateway order does not match.");
      }

      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${payment.gatewayOrderId}|${data.paymentGatewayPaymentId}`)
        .digest("hex");

      const providedSignature = Buffer.from(
        data.paymentGatewaySignature,
        "utf8",
      );
      const expectedSignatureBuffer = Buffer.from(expectedSignature, "utf8");

      if (
        providedSignature.length !== expectedSignatureBuffer.length ||
        !crypto.timingSafeEqual(expectedSignatureBuffer, providedSignature)
      ) {
        throw new ApiError(400, "Invalid payment signature.");
      }

      await paymentRepository.update(
        payment.id,
        {
          status: "PAID",
          gatewayOrderId: data.paymentGatewayOrderId,
          gatewayPaymentId: data.paymentGatewayPaymentId,
          gatewaySignature: data.paymentGatewaySignature,
          paidAt: new Date(),
        },
        tx,
      );

      await orderRepository.update(
        payment.orderId,
        {
          status: "CONFIRMED",
        },
        tx,
      );

      await this._confirmReservedInventory(payment.order.orderItems, tx);

      return paymentRepository.findById(payment.id, tx);
    });
  }

  async refundPayment(id, reason) {
    const payment = await paymentRepository.findById(id);

    if (!payment) {
      throw new ApiError(404, "Payment not found.");
    }

    if (payment.status !== "PAID") {
      throw new ApiError(400, "Only paid payments can be refunded.");
    }

    if (payment.paymentMethod === "COD" || !payment.gatewayPaymentId) {
      throw new ApiError(400, "This payment cannot be refunded through Razorpay.");
    }

    const refund = await razorpay.payments.refund(payment.gatewayPaymentId, {
      notes: {
        reason: reason || "Admin refund",
      },
    });

    return prisma.$transaction(async (tx) => {
      const updatedPayment = await paymentRepository.update(
        payment.id,
        {
          status: "REFUNDED",
          gatewayResponse: {
            refund,
          },
        },
        tx,
      );

      await orderRepository.update(
        payment.orderId,
        {
          status: "REFUNDED",
        },
        tx,
      );

      return updatedPayment;
    });
  }

  async createRazorpayOrder(paymentId, userId) {
    const payment = await paymentRepository.findById(paymentId);

    if (!payment) {
      throw new ApiError(404, "Payment not found.");
    }

    if (payment.order.userId !== userId) {
      throw new ApiError(403, "You are not authorized to access this payment.");
    }

    if (payment.paymentMethod === "COD") {
      throw new ApiError(400, "COD payments do not require Razorpay.");
    }

    if (payment.status === "PAID") {
      throw new ApiError(400, "Payment has already been completed.");
    }

    if (payment.gatewayOrderId) {
      const existingOrder = await razorpay.orders.fetch(payment.gatewayOrderId);
      return {
        paymentId: payment.id,
        key: process.env.RAZORPAY_KEY_ID,
        amount: existingOrder.amount,
        currency: existingOrder.currency,
        orderId: existingOrder.id,
      };
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(payment.amount) * 100),
      currency: "INR",
      receipt: payment.id,
    });

    await paymentRepository.update(payment.id, {
      gatewayOrderId: razorpayOrder.id,
    });

    return {
      paymentId: payment.id,
      key: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: razorpayOrder.id,
    };
  }

  async _confirmReservedInventory(orderItems, tx) {
    for (const item of orderItems) {
      const result = await tx.inventory.updateMany({
        where: {
          productVariantId: item.productVariantId,
          quantityReserved: { gte: item.quantity },
        },
        data: {
          quantityReserved: { decrement: item.quantity },
          lastStockUpdatedAt: new Date(),
        },
      });

      if (result.count !== 1) {
        throw new ApiError(409, "Reserved inventory is no longer available.");
      }
    }
  }
}

export default new PaymentService();
