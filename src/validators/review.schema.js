const { z } = require("zod");

const createReviewSchema = z.object({
  body: z.object({
    product: z.string(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(1000)
  })
});

const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().max(1000).optional(),
    approved: z.boolean().optional()
  })
});

module.exports = { createReviewSchema, updateReviewSchema };
