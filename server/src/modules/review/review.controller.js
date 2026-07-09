import asyncHandler from "../../common/asyncHandler.js";
import ApiResponse from "../../common/ApiResponse.js";

import reviewService from "./review.service.js";

class ReviewController {
  getReviews = asyncHandler(async (req, res) => {
    const result = await reviewService.getReviews(req.query);

    return res.status(200).json(
      new ApiResponse(
        200,
        "Reviews fetched successfully.",
        result,
      ),
    );
  });

  getReviewById = asyncHandler(async (req, res) => {
    const review = await reviewService.getReviewById(
      req.params.id,
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Review fetched successfully.",
        review,
      ),
    );
  });

  createReview = asyncHandler(async (req, res) => {
    const review = await reviewService.createReview(
      req.user.id,
      req.body,
    );

    return res.status(201).json(
      new ApiResponse(
        201,
        "Review created successfully.",
        review,
      ),
    );
  });

  updateReview = asyncHandler(async (req, res) => {
    const review = await reviewService.updateReview(
      req.user.id,
      req.params.id,
      req.body,
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Review updated successfully.",
        review,
      ),
    );
  });

  deleteReview = asyncHandler(async (req, res) => {
    const result = await reviewService.deleteReview(
      req.user.id,
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
}

export default new ReviewController();