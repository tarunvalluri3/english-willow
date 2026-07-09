import prisma from "../../config/prisma.js";

class DashboardRepository {
  async getSummary(tx = prisma) {
    const [
      totalProducts,
      totalCategories,
      totalCustomers,
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockProducts,
    ] = await Promise.all([
      tx.product.count(),

      tx.category.count(),

      tx.user.count({
        where: {
          role: "CUSTOMER",
        },
      }),

      tx.order.count(),

      tx.order.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          status: {
            not: "CANCELLED",
          },
        },
      }),

      tx.order.count({
        where: {
          status: "PENDING",
        },
      }),

      tx.inventory.count({
        where: {
          quantityAvailable: {
            lte: 5,
          },
        },
      }),
    ]);

    return {
      totalProducts,

      totalCategories,

      totalCustomers,

      totalOrders,

      totalRevenue:
        Number(totalRevenue._sum.totalAmount || 0),

      pendingOrders,

      lowStockProducts,
    };
  }

  async getRecentOrders(tx = prisma) {
    return tx.order.findMany({
      take: 10,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        user: true,
      },
    });
  }

  async getLowStockProducts(tx = prisma) {
    return tx.inventory.findMany({
      where: {
        quantityAvailable: {
          lte: 5,
        },
      },

      include: {
        productVariant: {
          include: {
            product: true,
          },
        },
      },

      orderBy: {
        quantityAvailable: "asc",
      },
    });
  }

  async getRecentCustomers(tx = prisma) {
    return tx.user.findMany({
      where: {
        role: "CUSTOMER",
      },

      take: 10,

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getTopProducts(tx = prisma) {
    return tx.orderItem.groupBy({
      by: ["productVariantId"],

      _sum: {
        quantity: true,
      },

      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },

      take: 10,
    });
  }
}

export default new DashboardRepository();