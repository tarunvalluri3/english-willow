import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Common Schemas
|--------------------------------------------------------------------------
*/

const uuidSchema = z.string().uuid("Invalid ID.");

/*
|--------------------------------------------------------------------------
| Add Item To Cart
|--------------------------------------------------------------------------
*/

const addCartItemSchema = z.object({
  body: z.object({
    productVariantId: uuidSchema,

    quantity: z
      .number()
      .int("Quantity must be an integer.")
      .min(1, "Quantity must be at least 1."),
  }),
});

/*
|--------------------------------------------------------------------------
| Update Cart Item
|--------------------------------------------------------------------------
*/

const updateCartItemSchema = z.object({
  params: z.object({
    itemId: uuidSchema,
  }),

  body: z.object({
    quantity: z
      .number()
      .int("Quantity must be an integer.")
      .min(1, "Quantity must be at least 1."),
  }),
});

/*
|--------------------------------------------------------------------------
| Remove Cart Item
|--------------------------------------------------------------------------
*/

const cartItemIdSchema = z.object({
  params: z.object({
    itemId: uuidSchema,
  }),
});

/*
|--------------------------------------------------------------------------
| Get Cart
|--------------------------------------------------------------------------
*/

const getCartSchema = z.object({
  query: z.object({}),
});

/*
|--------------------------------------------------------------------------
| Clear Cart
|--------------------------------------------------------------------------
*/

const clearCartSchema = z.object({
  query: z.object({}),
});

export {
  addCartItemSchema,
  updateCartItemSchema,
  cartItemIdSchema,
  getCartSchema,
  clearCartSchema,
};