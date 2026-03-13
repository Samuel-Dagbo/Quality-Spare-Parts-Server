const { z } = require("zod");

const orderSchema = z.object({
  body: z.object({
    customerInfo: z.object({
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().optional(),
      address: z.string().min(5)
    }),
    items: z.array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive()
      })
    ),
    paymentMethod: z.string().optional()
  })
});

const orderStatusSchema = z.object({
  body: z.object({
    status: z.enum(["pending", "confirmed", "shipped", "completed", "cancelled"])
  })
});

// Quick sale uses the same shape as a regular order for now; exporting separately
// keeps the route flexible if we need to adjust it later.
const quickSaleSchema = orderSchema;

module.exports = { orderSchema, quickSaleSchema, orderStatusSchema };
