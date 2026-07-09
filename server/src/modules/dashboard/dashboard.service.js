import ApiError from "../../common/ApiError.js";

import dashboardRepository from "./dashboard.repository.js";

class DashboardService {
  async getSummary() {
    return dashboardRepository.getSummary();
  }

  async getRecentOrders() {
    return dashboardRepository.getRecentOrders();
  }

  async getLowStockProducts() {
    return dashboardRepository.getLowStockProducts();
  }

  async getRecentCustomers() {
    return dashboardRepository.getRecentCustomers();
  }

  async getTopProducts() {
    const products =
      await dashboardRepository.getTopProducts();

    if (!products.length) {
      throw new ApiError(
        404,
        "No product sales found."
      );
    }

    return products;
  }
}

export default new DashboardService();