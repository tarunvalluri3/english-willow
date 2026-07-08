import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Common Schemas
|--------------------------------------------------------------------------
*/

const uuidSchema = z.string().uuid("Invalid ID.");

/*
|--------------------------------------------------------------------------
| Get Wishlist
|--------------------------------------------------------------------------
*/

const getWishlistSchema = z.object({
  query: z.object({}),
});

/*
|--------------------------------------------------------------------------
| Add Item To Wishlist
|--------------------------------------------------------------------------
*/

const addWishlistItemSchema = z.object({
  body: z.object({
    productId: uuidSchema,
  }),
});

/*
|--------------------------------------------------------------------------
| Remove Wishlist Item
|--------------------------------------------------------------------------
*/

const wishlistItemIdSchema = z.object({
  params: z.object({
    itemId: uuidSchema,
  }),
});

/*
|--------------------------------------------------------------------------
| Clear Wishlist
|--------------------------------------------------------------------------
*/

const clearWishlistSchema = z.object({
  query: z.object({}),
});

export {
  getWishlistSchema,
  addWishlistItemSchema,
  wishlistItemIdSchema,
  clearWishlistSchema,
};