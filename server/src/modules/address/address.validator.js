import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Common Params
|--------------------------------------------------------------------------
*/

export const addressIdSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid address ID."),
  }),
});

/*
|--------------------------------------------------------------------------
| Create Address
|--------------------------------------------------------------------------
*/

export const createAddressSchema = z.object({
  body: z.object({
    type: z.enum([
      "HOME",
      "WORK",
      "OTHER",
    ]),

    fullName: z
      .string()
      .trim()
      .min(2)
      .max(150),

    phone: z
      .string()
      .trim()
      .min(10)
      .max(20),

    addressLine1: z
      .string()
      .trim()
      .min(5)
      .max(255),

    addressLine2: z
      .string()
      .trim()
      .max(255)
      .optional(),

    landmark: z
      .string()
      .trim()
      .max(255)
      .optional(),

    city: z
      .string()
      .trim()
      .min(2)
      .max(100),

    state: z
      .string()
      .trim()
      .min(2)
      .max(100),

    postalCode: z
      .string()
      .trim()
      .min(4)
      .max(20),

    country: z
      .string()
      .trim()
      .max(100)
      .optional(),

    isDefault: z
      .boolean()
      .optional(),
  }),
});

/*
|--------------------------------------------------------------------------
| Update Address
|--------------------------------------------------------------------------
*/

export const updateAddressSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid address ID."),
  }),

  body: z.object({
    type: z
      .enum(["HOME", "WORK", "OTHER"])
      .optional(),

    fullName: z
      .string()
      .trim()
      .min(2)
      .max(150)
      .optional(),

    phone: z
      .string()
      .trim()
      .min(10)
      .max(20)
      .optional(),

    addressLine1: z
      .string()
      .trim()
      .min(5)
      .max(255)
      .optional(),

    addressLine2: z
      .string()
      .trim()
      .max(255)
      .optional(),

    landmark: z
      .string()
      .trim()
      .max(255)
      .optional(),

    city: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .optional(),

    state: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .optional(),

    postalCode: z
      .string()
      .trim()
      .min(4)
      .max(20)
      .optional(),

    country: z
      .string()
      .trim()
      .max(100)
      .optional(),

    isDefault: z
      .boolean()
      .optional(),
  }),
});

/*
|--------------------------------------------------------------------------
| List Addresses
|--------------------------------------------------------------------------
*/

export const listAddressesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),

    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
});

/*
|--------------------------------------------------------------------------
| Delete Address
|--------------------------------------------------------------------------
*/

export const deleteAddressSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid address ID."),
  }),
});