const { z } = require("zod");

const supplierSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    contactName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    isActive: z.boolean().optional()
  })
});

const supplierUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    contactName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    isActive: z.boolean().optional()
  })
});

module.exports = { supplierSchema, supplierUpdateSchema };
