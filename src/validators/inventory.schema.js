const { z } = require("zod");

const adjustmentSchema = z.object({
  body: z.object({
    product: z.string(),
    type: z.enum(["in", "out", "adjust"]),
    quantity: z.number().int().positive(),
    reason: z.string().optional()
  })
});

module.exports = { adjustmentSchema };
