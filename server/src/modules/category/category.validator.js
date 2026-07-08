import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Common Schemas
|--------------------------------------------------------------------------
*/

const uuidSchema = z.string().uuid("Invalid category ID.");

/*
|--------------------------------------------------------------------------
| Create Category
|--------------------------------------------------------------------------
*/

const createCategorySchema = z.object({
  body: z.object({
    parentId: uuidSchema.nullable().optional(),

    name: z
      .string()
      .trim()
      .min(2, "Category name must be at least 2 characters.")
      .max(100, "Category name cannot exceed 100 characters."),

    description: z
      .string()
      .trim()
      .max(1000, "Description cannot exceed 1000 characters.")
      .optional(),

    imageUrl: z.string().trim().url("Invalid image URL.").optional(),

    displayOrder: z
      .number()
      .int()
      .min(0, "Display order cannot be negative.")
      .optional(),

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
| Update Category
|--------------------------------------------------------------------------
*/

const updateCategorySchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),

  body: z
    .object({
      parentId: uuidSchema.nullable().optional(),

      name: z
        .string()
        .trim()
        .min(2)
        .max(100)
        .optional(),

      description: z
        .string()
        .trim()
        .max(1000)
        .optional(),

      imageUrl: z
        .string()
        .trim()
        .url()
        .optional(),

      displayOrder: z
        .number()
        .int()
        .min(0)
        .optional(),

      metaTitle: z
        .string()
        .trim()
        .max(255)
        .optional(),

      metaDescription: z
        .string()
        .trim()
        .max(500)
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required to update.",
    }),
});

/*
|--------------------------------------------------------------------------
| Category ID
|--------------------------------------------------------------------------
*/

const categoryIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

/*
|--------------------------------------------------------------------------
| List Categories
|--------------------------------------------------------------------------
*/

const listCategoriesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),

    limit: z.coerce.number().int().min(1).max(100).optional(),

    search: z.string().trim().optional(),

    parentId: uuidSchema.optional(),
  }),
});

export {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
  listCategoriesSchema,
};