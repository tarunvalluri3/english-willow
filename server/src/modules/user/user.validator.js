import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Common Params
|--------------------------------------------------------------------------
*/

export const userIdSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid user ID."),
  }),
});

/*
|--------------------------------------------------------------------------
| List Users
|--------------------------------------------------------------------------
*/

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),

    limit: z.coerce.number().int().positive().max(100).optional(),

    role: z
      .enum(["CUSTOMER", "ADMIN", "SUPER_ADMIN"])
      .optional(),

    status: z
      .enum(["ACTIVE", "INACTIVE", "BLOCKED"])
      .optional(),

    search: z.string().trim().optional(),
  }),
});

/*
|--------------------------------------------------------------------------
| Update Role
|--------------------------------------------------------------------------
*/

export const updateRoleSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),

  body: z.object({
    role: z.enum([
      "CUSTOMER",
      "ADMIN",
      "SUPER_ADMIN",
    ]),
  }),
});

/*
|--------------------------------------------------------------------------
| Update Status
|--------------------------------------------------------------------------
*/

export const updateStatusSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),

  body: z.object({
    status: z.enum([
      "ACTIVE",
      "INACTIVE",
      "BLOCKED",
    ]),
  }),
});