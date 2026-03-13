const { z } = require("zod");

const categorySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    description: z.string().optional(),
    isActive: z.boolean().optional()
  })
});

const categoryUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    slug: z.string().min(2).optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional()
  })
});

module.exports = { categorySchema, categoryUpdateSchema };
