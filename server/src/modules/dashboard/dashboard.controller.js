import asyncHandler from "../../common/asyncHandler.js";
import ApiResponse from "../../common/ApiResponse.js";

import dashboardService from "./dashboard.service.js";

class DashboardController {
  getSummary = asyncHandler(async (req, res) => {
    const summary = await dashboardService.getSummary();

    return res.status(200).json(
      new ApiResponse(
        200,
        "Dashboard summary fetched successfully.",
        summary,
      ),
    );
  });

  getRecentOrders = asyncHandler(async (req, res) => {
    const orders =
      await dashboardService.getRecentOrders();

    return res.status(200).json(
      new ApiResponse(
        200,
        "Recent orders fetched successfully.",
        orders,
      ),
    );
  });

  getLowStockProducts = asyncHandler(async (req, res) => {
    const products =
      await dashboardService.getLowStockProducts();

    return res.status(200).json(
      new ApiResponse(
        200,
        "Low stock products fetched successfully.",
        products,
      ),
    );
  });

  getTopProducts = asyncHandler(async (req, res) => {
    const products =
      await dashboardService.getTopProducts();

    return res.status(200).json(
      new ApiResponse(
        200,
        "Top selling products fetched successfully.",
        products,
      ),
    );
  });

  getRecentCustomers = asyncHandler(async (req, res) => {
    const customers =
      await dashboardService.getRecentCustomers();

    return res.status(200).json(
      new ApiResponse(
        200,
        "Recent customers fetched successfully.",
        customers,
      ),
    );
  });
}

export default new DashboardController();