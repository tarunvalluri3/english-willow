import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Common Schemas
|--------------------------------------------------------------------------
*/

const uuidSchema = z.string().uuid("Invalid product ID.");

const categoryIdSchema = z.string().uuid("Invalid category ID.");

/*
|--------------------------------------------------------------------------
| Create Product
|--------------------------------------------------------------------------
*/

const createProductSchema = z.object({
  body: z.object({
    categoryId: categoryIdSchema,

    productCode: z
      .string()
      .trim()
      .min(1, "Product code is required.")
      .max(50, "Product code cannot exceed 50 characters."),

    name: z
      .string()
      .trim()
      .min(2, "Product name must be at least 2 characters.")
      .max(200, "Product name cannot exceed 200 characters."),

    shortDescription: z
      .string()
      .trim()
      .max(500, "Short description cannot exceed 500 characters.")
      .optional(),

    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters."),

    isFeatured: z.boolean().optional(),

    metaTitle: z
      .string()
      .trim()
      .max(255, "Meta title cannot exceed 255 characters.")
      .optional(),

    metaDescription: z
      .string()
      .trim()
      .max(500, "Meta description cannot exceed 500 characters.")
      .optional(),
  }),
});

/*
|--------------------------------------------------------------------------
| Update Product
|--------------------------------------------------------------------------
*/

const updateProductSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),

  body: z
    .object({
      categoryId: categoryIdSchema.optional(),

      productCode: z.string().trim().min(1).max(50).optional(),

      name: z.string().trim().min(2).max(200).optional(),

      shortDescription: z.string().trim().max(500).optional(),

      description: z.string().trim().min(10).optional(),

      isFeatured: z.boolean().optional(),

      status: z
        .enum(["DRAFT", "ACTIVE", "OUT_OF_STOCK", "INACTIVE", "ARCHIVED"])
        .optional(),

      metaTitle: z.string().trim().max(255).optional(),

      metaDescription: z.string().trim().max(500).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required to update.",
    }),
});

/*
|--------------------------------------------------------------------------
| Product ID
|--------------------------------------------------------------------------
*/

const productIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

const productSlugSchema = z.object({
  params: z.object({
    slug: z
      .string()
      .trim()
      .min(1, "Product slug is required.")
      .max(220, "Product slug is invalid."),
  }),
});

/*
|--------------------------------------------------------------------------
| List Products
|--------------------------------------------------------------------------
*/

const listProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),

    limit: z.coerce.number().int().min(1).max(100).optional(),

    search: z.string().trim().optional(),

    categoryId: categoryIdSchema.optional(),

    status: z
      .enum(["DRAFT", "ACTIVE", "OUT_OF_STOCK", "INACTIVE", "ARCHIVED"])
      .optional(),

    featured: z
      .enum(["true", "false"])
      .optional()
      .transform((value) =>
        value === undefined ? undefined : value === "true",
      ),
  }),
});

export {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  productSlugSchema,
  listProductsSchema,
};
