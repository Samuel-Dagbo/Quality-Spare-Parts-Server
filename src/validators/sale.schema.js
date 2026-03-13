const { z } = require("zod");

const saleSchema = z.object({
  body: z.object({
    customerName: z.string().min(2),
    customerContact: z.string().optional(),
    paymentMethod: z.enum(["cash", "momo", "card"]),
    items: z.array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive()
      })
    )
  })
});

module.exports = { saleSchema };
