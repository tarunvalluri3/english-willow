import prisma from "../../config/prisma.js";

import ApiError from "../../common/ApiError.js";
import { getPagination, getPaginationMeta } from "../../common/pagination.js";

import couponRepository from "./coupon.repository.js";

class CouponService {
  async getCoupons(query) {
    const { page, limit, skip } = getPagination(query);

    const filters = {
      skip,
      take: limit,
      status: query.status,
    };

    const [coupons, totalItems] = await Promise.all([
      couponRepository.findMany(filters),
      couponRepository.count(filters),
    ]);

    return {
      coupons,
      meta: getPaginationMeta(page, limit, totalItems),
    };
  }

  async getCouponById(id) {
    const coupon = await couponRepository.findById(id);

    if (!coupon) {
      throw new ApiError(404, "Coupon not found.");
    }

    return coupon;
  }

  async createCoupon(data) {
    this._validateCouponRules(data);

    const existingCoupon = await couponRepository.findByCode(data.code);

    if (existingCoupon) {
      throw new ApiError(400, "Coupon code already exists.");
    }

    return couponRepository.create(data);
  }

  async updateCoupon(id, data) {
    const coupon = await couponRepository.findById(id);

    if (!coupon) {
      throw new ApiError(404, "Coupon not found.");
    }

    this._validateCouponRules({ ...coupon, ...data });

    return couponRepository.update(id, data);
  }

  async deleteCoupon(id) {
    const coupon = await couponRepository.findById(id);

    if (!coupon) {
      throw new ApiError(404, "Coupon not found.");
    }

    await couponRepository.delete(id);

    return { message: "Coupon deleted successfully." };
  }

  async applyCoupon(data, tx = prisma) {
    const coupon = await couponRepository.findByCode(data.code, tx);

    if (!coupon) {
      throw new ApiError(404, "Coupon not found.");
    }

    if (coupon.status !== "ACTIVE") {
      throw new ApiError(400, "Coupon is inactive.");
    }

    const now = new Date();

    if (now < coupon.startsAt) {
      throw new ApiError(400, "Coupon is not active yet.");
    }

    if (now > coupon.expiresAt) {
      throw new ApiError(400, "Coupon has expired.");
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new ApiError(400, "Coupon usage limit reached.");
    }

    const orderAmount = Number(data.orderAmount);

    if (
      coupon.minimumOrderAmount &&
      orderAmount < Number(coupon.minimumOrderAmount)
    ) {
      throw new ApiError(
        400,
        `Minimum order amount is Rs. ${coupon.minimumOrderAmount}.`,
      );
    }

    let discount = 0;

    if (coupon.discountType === "PERCENTAGE") {
      discount = (orderAmount * Number(coupon.discountValue)) / 100;

      if (
        coupon.maximumDiscountAmount &&
        discount > Number(coupon.maximumDiscountAmount)
      ) {
        discount = Number(coupon.maximumDiscountAmount);
      }
    } else {
      discount = Number(coupon.discountValue);
    }

    // A coupon must never reduce an order below zero.
    discount = Math.min(discount, orderAmount);

    return {
      coupon,
      discount: Number(discount.toFixed(2)),
      finalAmount: Number((orderAmount - discount).toFixed(2)),
    };
  }

  async incrementCouponUsage(id, tx = prisma) {
    return couponRepository.incrementUsage(id, tx);
  }

  _validateCouponRules(coupon) {
    if (
      coupon.discountType === "PERCENTAGE" &&
      Number(coupon.discountValue) > 100
    ) {
      throw new ApiError(400, "Percentage discount cannot exceed 100.");
    }

    if (new Date(coupon.expiresAt) <= new Date(coupon.startsAt)) {
      throw new ApiError(400, "Expiry date must be after the start date.");
    }
  }
}

export default new CouponService();
