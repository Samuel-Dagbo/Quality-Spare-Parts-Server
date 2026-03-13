const { z } = require("zod");

const brandSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    isActive: z.boolean().optional()
  })
});

const brandUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    slug: z.string().min(2).optional(),
    isActive: z.boolean().optional()
  })
});

module.exports = { brandSchema, brandUpdateSchema };
