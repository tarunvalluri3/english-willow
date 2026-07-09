import asyncHandler from "../../common/asyncHandler.js";
import ApiResponse from "../../common/ApiResponse.js";

import couponService from "./coupon.service.js";

class CouponController {
  getCoupons = asyncHandler(async (req, res) => {
    const result = await couponService.getCoupons(req.query);

    return res.status(200).json(
      new ApiResponse(
        200,
        "Coupons fetched successfully.",
        result,
      ),
    );
  });

  getCouponById = asyncHandler(async (req, res) => {
    const coupon = await couponService.getCouponById(
      req.params.id,
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Coupon fetched successfully.",
        coupon,
      ),
    );
  });

  createCoupon = asyncHandler(async (req, res) => {
    const coupon = await couponService.createCoupon(
      req.body,
    );

    return res.status(201).json(
      new ApiResponse(
        201,
        "Coupon created successfully.",
        coupon,
      ),
    );
  });

  updateCoupon = asyncHandler(async (req, res) => {
    const coupon = await couponService.updateCoupon(
      req.params.id,
      req.body,
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Coupon updated successfully.",
        coupon,
      ),
    );
  });

  deleteCoupon = asyncHandler(async (req, res) => {
    const result = await couponService.deleteCoupon(
      req.params.id,
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        result.message,
        null,
      ),
    );
  });

  applyCoupon = asyncHandler(async (req, res) => {
    const result = await couponService.applyCoupon(
      req.body,
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Coupon applied successfully.",
        result,
      ),
    );
  });
}

export default new CouponController();