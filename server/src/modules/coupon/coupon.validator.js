import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Common Params
|--------------------------------------------------------------------------
*/

export const couponIdSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid coupon ID."),
  }),
});

/*
|--------------------------------------------------------------------------
| Create Coupon
|--------------------------------------------------------------------------
*/

export const createCouponSchema = z.object({
  body: z.object({
    code: z
      .string()
      .trim()
      .min(3)
      .max(50)
      .transform((value) => value.toUpperCase()),

    name: z.string().trim().min(2).max(150),

    description: z
      .string()
      .trim()
      .max(500)
      .optional(),

    discountType: z.enum([
      "PERCENTAGE",
      "FIXED_AMOUNT",
    ]),

    discountValue: z
      .number()
      .positive(),

    minimumOrderAmount: z
      .number()
      .min(0)
      .default(0),

    maximumDiscountAmount: z
      .number()
      .positive()
      .optional(),

    usageLimit: z
      .number()
      .int()
      .positive()
      .optional(),

    startsAt: z.coerce.date(),

    expiresAt: z.coerce.date(),

    status: z.enum(["ACTIVE", "INACTIVE", "EXPIRED"]).optional(),
  }).refine((data) => data.expiresAt > data.startsAt, {
    message: "Expiry date must be after the start date.",
    path: ["expiresAt"],
  }),
});

/*
|--------------------------------------------------------------------------
| Update Coupon
|--------------------------------------------------------------------------
*/

export const updateCouponSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid coupon ID."),
  }),

  body: z.object({
    description: z
      .string()
      .trim()
      .max(500)
      .optional(),

    discountType: z
      .enum(["PERCENTAGE", "FIXED_AMOUNT"])
      .optional(),

    discountValue: z
      .number()
      .positive()
      .optional(),

    minimumOrderAmount: z
      .number()
      .min(0)
      .optional(),

    maximumDiscountAmount: z
      .number()
      .positive()
      .optional(),

    usageLimit: z
      .number()
      .int()
      .positive()
      .optional(),

    startsAt: z.coerce.date().optional(),

    expiresAt: z.coerce.date().optional(),

    status: z.enum(["ACTIVE", "INACTIVE", "EXPIRED"]).optional(),
  }),
});

/*
|--------------------------------------------------------------------------
| Apply Coupon
|--------------------------------------------------------------------------
*/

export const applyCouponSchema = z.object({
  body: z.object({
    code: z
      .string()
      .trim()
      .min(3)
      .transform((value) => value.toUpperCase()),

    orderAmount: z
      .number()
      .positive(),
  }),
});

/*
|--------------------------------------------------------------------------
| List Coupons
|--------------------------------------------------------------------------
*/

export const listCouponsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),

    limit: z.coerce.number().int().positive().max(100).optional(),

    status: z.enum(["ACTIVE", "INACTIVE", "EXPIRED"]).optional(),
  }),
});

/*
|--------------------------------------------------------------------------
| Delete Coupon
|--------------------------------------------------------------------------
*/

export const deleteCouponSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid coupon ID."),
  }),
});
