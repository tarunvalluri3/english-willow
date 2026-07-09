import prisma from "../../config/prisma.js";

import ApiError from "../../common/ApiError.js";
import {
  getPagination,
  getPaginationMeta,
} from "../../common/pagination.js";

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

  async getPaymentById(id) {
    const payment = await paymentRepository.findById(id);

    if (!payment) {
      throw new ApiError(404, "Payment not found.");
    }

    return payment;
  }

  async createPayment(data) {
    return prisma.$transaction(async (tx) => {
      const order = await orderRepository.findById(
        data.orderId,
        tx,
      );

      if (!order) {
        throw new ApiError(404, "Order not found.");
      }

      const existingPayment =
        await paymentRepository.findByOrderId(
          order.id,
          tx,
        );

      if (existingPayment) {
        throw new ApiError(
          400,
          "Payment already exists for this order."
        );
      }

      const payment = await paymentRepository.create(
        {
          orderId: order.id,

          paymentMethod: data.paymentMethod,

          amount: order.totalAmount,

          paymentGateway:
            data.paymentMethod === "COD"
              ? "COD"
              : "RAZORPAY",
        },
        tx,
      );

      return paymentRepository.findById(payment.id, tx);
    });
  }

  async verifyPayment(data) {
    return prisma.$transaction(async (tx) => {
      const payment = await paymentRepository.findById(
        data.paymentId,
        tx,
      );

      if (!payment) {
        throw new ApiError(404, "Payment not found.");
      }

      if (payment.status === "SUCCESS") {
        throw new ApiError(
          400,
          "Payment has already been verified."
        );
      }

      await paymentRepository.update(
        payment.id,
        {
          status: "SUCCESS",

          gatewayOrderId:
            data.paymentGatewayOrderId,

          gatewayPaymentId:
            data.paymentGatewayPaymentId,

          gatewaySignature:
            data.paymentGatewaySignature,

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

      return paymentRepository.findById(
        payment.id,
        tx,
      );
    });
  }

  async refundPayment(id, reason) {
    return prisma.$transaction(async (tx) => {
      const payment = await paymentRepository.findById(
        id,
        tx,
      );

      if (!payment) {
        throw new ApiError(404, "Payment not found.");
      }

      if (payment.status !== "SUCCESS") {
        throw new ApiError(
          400,
          "Only successful payments can be refunded."
        );
      }

      await paymentRepository.update(
        payment.id,
        {
          status: "REFUNDED",
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

      return paymentRepository.findById(
        payment.id,
        tx,
      );
    });
  }
}

export default new PaymentService();