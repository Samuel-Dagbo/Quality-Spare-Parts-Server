const { z } = require("zod");

const addressSchema = z
  .object({
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional()
  })
  .partial();

const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["admin", "staff", "customer"]),
    phone: z.string().optional(),
    address: addressSchema.optional(),
    isActive: z.boolean().optional()
  })
});

const roleUpdateSchema = z.object({
  body: z.object({
    role: z.enum(["admin", "staff", "customer"])
  })
});

const statusUpdateSchema = z.object({
  body: z.object({
    isActive: z.boolean()
  })
});

module.exports = { createUserSchema, roleUpdateSchema, statusUpdateSchema };
