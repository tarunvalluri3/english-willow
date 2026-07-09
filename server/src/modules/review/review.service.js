import prisma from "../../config/prisma.js";

import ApiError from "../../common/ApiError.js";
import {
  getPagination,
  getPaginationMeta,
} from "../../common/pagination.js";

import reviewRepository from "./review.repository.js";
import orderItemRepository from "../order/orderItem.repository.js";

class ReviewService {
  async getReviews(query) {
    const { page, limit, skip } = getPagination(query);

    const filters = {
      skip,
      take: limit,
      productId: query.productId,
      rating: query.rating,
      status: query.status,
    };

    const [reviews, totalItems] = await Promise.all([
      reviewRepository.findMany(filters),
      reviewRepository.count(filters),
    ]);

    return {
      reviews,
      meta: getPaginationMeta(page, limit, totalItems),
    };
  }

  async getReviewById(id) {
    const review = await reviewRepository.findById(id);

    if (!review) {
      throw new ApiError(404, "Review not found.");
    }

    return review;
  }

  async createReview(userId, data) {
    return prisma.$transaction(async (tx) => {
      const orderItem = await orderItemRepository.findById(
        data.orderItemId,
        tx,
      );

      if (!orderItem) {
        throw new ApiError(404, "Order item not found.");
      }

      if (orderItem.order.userId !== userId) {
        throw new ApiError(
          403,
          "You are not allowed to review this product.",
        );
      }

      if (orderItem.order.status !== "DELIVERED") {
        throw new ApiError(
          400,
          "Reviews can only be submitted after delivery.",
        );
      }

      const existingReview =
        await reviewRepository.findByOrderItemId(
          orderItem.id,
          tx,
        );

      if (existingReview) {
        throw new ApiError(
          400,
          "You have already reviewed this product.",
        );
      }

      const review = await reviewRepository.create(
        {
          userId,

          productId:
            orderItem.productVariant.productId,

          orderItemId: orderItem.id,

          rating: data.rating,

          title: data.title,

          comment: data.comment,

          isVerifiedPurchase: true,
        },
        tx,
      );

      return reviewRepository.findById(review.id, tx);
    });
  }

  async updateReview(userId, reviewId, data) {
    return prisma.$transaction(async (tx) => {
      const review = await reviewRepository.findById(
        reviewId,
        tx,
      );

      if (!review) {
        throw new ApiError(404, "Review not found.");
      }

      if (review.userId !== userId) {
        throw new ApiError(
          403,
          "You are not authorized to update this review.",
        );
      }

      await reviewRepository.update(
        review.id,
        {
          rating: data.rating,
          title: data.title,
          comment: data.comment,
        },
        tx,
      );

      return reviewRepository.findById(review.id, tx);
    });
  }

  async deleteReview(userId, reviewId) {
    return prisma.$transaction(async (tx) => {
      const review = await reviewRepository.findById(
        reviewId,
        tx,
      );

      if (!review) {
        throw new ApiError(404, "Review not found.");
      }

      if (review.userId !== userId) {
        throw new ApiError(
          403,
          "You are not authorized to delete this review.",
        );
      }

      await reviewRepository.delete(review.id, tx);

      return {
        message: "Review deleted successfully.",
      };
    });
  }
}

export default new ReviewService();