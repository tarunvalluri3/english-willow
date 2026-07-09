import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Common Params
|--------------------------------------------------------------------------
*/

export const reviewIdSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid review ID."),
  }),
});

/*
|--------------------------------------------------------------------------
| Create Review
|--------------------------------------------------------------------------
*/

export const createReviewSchema = z.object({
  body: z.object({
    orderItemId: z.uuid("Invalid order item ID."),

    rating: z
      .number()
      .int()
      .min(1, "Rating must be at least 1.")
      .max(5, "Rating cannot exceed 5."),

    title: z
      .string()
      .trim()
      .min(3)
      .max(150)
      .optional(),

    comment: z
      .string()
      .trim()
      .min(3)
      .max(2000)
      .optional(),
  }),
});

/*
|--------------------------------------------------------------------------
| Update Review
|--------------------------------------------------------------------------
*/

export const updateReviewSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid review ID."),
  }),

  body: z.object({
    rating: z
      .number()
      .int()
      .min(1)
      .max(5)
      .optional(),

    title: z
      .string()
      .trim()
      .min(3)
      .max(150)
      .optional(),

    comment: z
      .string()
      .trim()
      .min(3)
      .max(2000)
      .optional(),
  }),
});

/*
|--------------------------------------------------------------------------
| List Reviews
|--------------------------------------------------------------------------
*/

export const listReviewsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),

    limit: z.coerce.number().int().positive().max(100).optional(),

    rating: z.coerce.number().int().min(1).max(5).optional(),

    productId: z.uuid().optional(),
  }),
});

/*
|--------------------------------------------------------------------------
| Delete Review
|--------------------------------------------------------------------------
*/

export const deleteReviewSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid review ID."),
  }),
});