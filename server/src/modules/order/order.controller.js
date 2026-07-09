import asyncHandler from "../../common/asyncHandler.js";
import ApiResponse from "../../common/ApiResponse.js";

import orderService from "./order.service.js";

class OrderController {
  getOrders = asyncHandler(async (req, res) => {
    const result = await orderService.getOrders(
      req.user.id,
      req.query,
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Orders fetched successfully.",
        result,
      ),
    );
  });

  getOrderById = asyncHandler(async (req, res) => {
    const order = await orderService.getOrderById(
      req.user.id,
      req.params.id,
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Order fetched successfully.",
        order,
      ),
    );
  });

  createOrder = asyncHandler(async (req, res) => {
    const order = await orderService.createOrder(
      req.user.id,
      req.body,
    );

    return res.status(201).json(
      new ApiResponse(
        201,
        "Order created successfully.",
        order,
      ),
    );
  });

  cancelOrder = asyncHandler(async (req, res) => {
    const order = await orderService.cancelOrder(
      req.user.id,
      req.params.id,
      req.body,
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Order cancelled successfully.",
        order,
      ),
    );
  });

  updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await orderService.updateOrderStatus(
      req.params.id,
      req.body.status,
      req.body.notes,
      req.user.id,
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Order status updated successfully.",
        order,
      ),
    );
  });
}

export default new OrderController();