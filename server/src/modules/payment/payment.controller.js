import asyncHandler from "../../common/asyncHandler.js";
import ApiResponse from "../../common/ApiResponse.js";

import paymentService from "./payment.service.js";

class PaymentController {
  getPayments = asyncHandler(async (req, res) => {
    const result = await paymentService.getPayments(req.query);

    return res
      .status(200)
      .json(new ApiResponse(200, "Payments fetched successfully.", result));
  });

  getPaymentById = asyncHandler(async (req, res) => {
    const payment = await paymentService.getPaymentById(req.params.id);

    return res
      .status(200)
      .json(new ApiResponse(200, "Payment fetched successfully.", payment));
  });

  createPayment = asyncHandler(async (req, res) => {
    const payment = await paymentService.createPayment(req.body);

    return res
      .status(201)
      .json(new ApiResponse(201, "Payment created successfully.", payment));
  });

  verifyPayment = asyncHandler(async (req, res) => {
    const payment = await paymentService.verifyPayment(req.body);

    return res
      .status(200)
      .json(new ApiResponse(200, "Payment verified successfully.", payment));
  });

  refundPayment = asyncHandler(async (req, res) => {
    const payment = await paymentService.refundPayment(
      req.params.id,
      req.body.reason,
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Payment refunded successfully.", payment));
  });

  createRazorpayOrder = asyncHandler(async (req, res) => {
    const result = await paymentService.createRazorpayOrder(
      req.params.id,
      req.user.id,
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Razorpay order created successfully.", result),
      );
  });
}

export default new PaymentController();
