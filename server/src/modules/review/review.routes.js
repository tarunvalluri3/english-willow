import { Router } from "express";

import reviewController from "./review.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import adminMiddleware from "../../middleware/admin.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import {
  reviewIdSchema,
  createReviewSchema,
  updateReviewSchema,
  deleteReviewSchema,
  listReviewsSchema,
} from "./review.validator.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  validate(listReviewsSchema),
  reviewController.getReviews
);

router.get(
  "/:id",
  validate(reviewIdSchema),
  reviewController.getReviewById
);

/*
|--------------------------------------------------------------------------
| Customer Routes
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authMiddleware,
  validate(createReviewSchema),
  reviewController.createReview
);

router.patch(
  "/:id",
  authMiddleware,
  validate(updateReviewSchema),
  reviewController.updateReview
);

router.delete(
  "/:id",
  authMiddleware,
  validate(deleteReviewSchema),
  reviewController.deleteReview
);

/*
|--------------------------------------------------------------------------
| Admin Routes (Future)
|--------------------------------------------------------------------------
*/

// router.patch(
//   "/:id/approve",
//   authMiddleware,
//   adminMiddleware,
//   reviewController.approveReview
// );

// router.patch(
//   "/:id/reject",
//   authMiddleware,
//   adminMiddleware,
//   reviewController.rejectReview
// );

export default router;