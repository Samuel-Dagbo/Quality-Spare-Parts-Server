const { z } = require("zod");

const cartItemSchema = z.object({
  body: z.object({
    productId: z.string(),
    quantity: z.number().int().positive()
  })
});

module.exports = { cartItemSchema };
