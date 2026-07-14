import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Common Schemas
|--------------------------------------------------------------------------
*/

const uuidSchema = z.string().uuid("Invalid ID.");

/*
|--------------------------------------------------------------------------
| Create Order
|--------------------------------------------------------------------------
*/

const createOrderSchema = z.object({
  body: z.object({
    addressId: uuidSchema,

    couponCode: z
      .string()
      .trim()
      .min(3, "Coupon code must be at least 3 characters.")
      .max(50, "Coupon code cannot exceed 50 characters.")
      .transform((value) => value.toUpperCase())
      .optional(),

    notes: z
      .string()
      .trim()
      .max(1000, "Notes cannot exceed 1000 characters.")
      .optional(),
  }),
});

/*
|--------------------------------------------------------------------------
| Order ID
|--------------------------------------------------------------------------
*/

const orderIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

/*
|--------------------------------------------------------------------------
| Cancel Order
|--------------------------------------------------------------------------
*/

const cancelOrderSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),

  body: z.object({
    notes: z
      .string()
      .trim()
      .max(1000, "Notes cannot exceed 1000 characters.")
      .optional(),
  }),
});

/*
|--------------------------------------------------------------------------
| Update Order Status (Admin)
|--------------------------------------------------------------------------
*/

const updateOrderStatusSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),

  body: z.object({
    status: z.enum([
      "PENDING",
      "CONFIRMED",
      "PACKING",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "RETURN_REQUESTED",
      "RETURNED",
      "REFUNDED",
    ]),

    notes: z
      .string()
      .trim()
      .max(1000, "Notes cannot exceed 1000 characters.")
      .optional(),
  }),
});

/*
|--------------------------------------------------------------------------
| List Orders
|--------------------------------------------------------------------------
*/

const listOrdersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),

    limit: z.coerce.number().int().min(1).max(100).optional(),

    status: z
      .enum([
        "PENDING",
        "CONFIRMED",
        "PACKING",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
        "RETURN_REQUESTED",
        "RETURNED",
        "REFUNDED",
      ])
      .optional(),
  }),
});

export {
  createOrderSchema,
  orderIdSchema,
  cancelOrderSchema,
  updateOrderStatusSchema,
  listOrdersSchema,
};
