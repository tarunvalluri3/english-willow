import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Common Schemas
|--------------------------------------------------------------------------
*/

const uuidSchema = z.string().uuid("Invalid product variant ID.");

const transactionTypeSchema = z.enum([
  "PURCHASE",
  "ORDER",
  "RETURN",
  "CANCELLATION",
  "MANUAL_ADJUSTMENT",
  "DAMAGED",
  "RESTOCK",
]);

/*
|--------------------------------------------------------------------------
| Update Inventory
|--------------------------------------------------------------------------
*/

const updateInventorySchema = z.object({
  params: z.object({
    variantId: uuidSchema,
  }),

  body: z.object({
    quantity: z
      .number()
      .int("Quantity must be an integer.")
      .min(0, "Quantity cannot be negative."),

    notes: z
      .string()
      .trim()
      .max(500, "Notes cannot exceed 500 characters.")
      .optional(),
  }),
});

/*
|--------------------------------------------------------------------------
| Inventory By Variant
|--------------------------------------------------------------------------
*/

const inventoryByVariantSchema = z.object({
  params: z.object({
    productVariantId: uuidSchema,
  }),
});

/*
|--------------------------------------------------------------------------
| List Inventory
|--------------------------------------------------------------------------
*/

const listInventorySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),

    limit: z.coerce.number().int().min(1).max(100).optional(),

    search: z.string().trim().optional(),

    lowStock: z
      .enum(["true", "false"])
      .optional()
      .transform((value) =>
        value === undefined ? undefined : value === "true"
      ),
  }),
});

/*
|--------------------------------------------------------------------------
| Create Inventory Transaction
|--------------------------------------------------------------------------
*/

const createInventoryTransactionSchema = z.object({
  body: z.object({
    productVariantId: uuidSchema,

    type: transactionTypeSchema,

    quantity: z
      .number()
      .int("Quantity must be an integer.")
      .positive("Quantity must be greater than zero."),

    notes: z
      .string()
      .trim()
      .max(500, "Notes cannot exceed 500 characters.")
      .optional(),
  }),
});

/*
|--------------------------------------------------------------------------
| List Inventory Transactions
|--------------------------------------------------------------------------
*/

const listInventoryTransactionsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),

    limit: z.coerce.number().int().min(1).max(100).optional(),

    variantId: uuidSchema.optional(),

    type: transactionTypeSchema.optional(),
  }),
});

export {
  updateInventorySchema,
  inventoryByVariantSchema,
  listInventorySchema,
  createInventoryTransactionSchema,
  listInventoryTransactionsSchema,
};