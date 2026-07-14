import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Common Params
|--------------------------------------------------------------------------
*/

export const paymentIdSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid payment ID."),
  }),
});

/*
|--------------------------------------------------------------------------
| Create Payment
|--------------------------------------------------------------------------
*/

export const createPaymentSchema = z.object({
  body: z.object({
    orderId: z.uuid("Invalid order ID."),

    paymentMethod: z.enum(["UPI", "CARD", "NET_BANKING", "COD", "WALLET"]),
  }),
});

/*
|--------------------------------------------------------------------------
| Verify Payment
|--------------------------------------------------------------------------
*/

export const verifyPaymentSchema = z.object({
  body: z.object({
    paymentId: z.uuid("Invalid payment ID."),

    paymentGatewayOrderId: z.string().min(1),

    paymentGatewayPaymentId: z.string().min(1),

    paymentGatewaySignature: z.string().min(1),
  }),
});

/*
|--------------------------------------------------------------------------
| Refund Payment
|--------------------------------------------------------------------------
*/

export const refundPaymentSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid payment ID."),
  }),

  body: z.object({
    reason: z.string().trim().max(500).optional(),
  }),
});

/*
|--------------------------------------------------------------------------
| List Payments
|--------------------------------------------------------------------------
*/

export const listPaymentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),

    limit: z.coerce.number().int().positive().max(100).optional(),

    status: z
      .enum(["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"])
      .optional(),

    paymentMethod: z
      .enum(["UPI", "CARD", "NET_BANKING", "COD", "WALLET"])
      .optional(),
  }),
});
