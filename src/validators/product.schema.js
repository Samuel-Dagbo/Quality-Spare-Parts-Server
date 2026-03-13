const { z } = require("zod");

const productSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    sku: z.string().min(3).optional(),
    partNumber: z.string().min(3).optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    supplier: z.string().optional(),
    description: z.string().optional(),
    price: z.number().nonnegative().optional(),
    sellingPrice: z.number().nonnegative().optional(),
    costPrice: z.number().nonnegative().optional(),
    buyingPrice: z.number().nonnegative().optional(),
    stockQty: z.number().int().nonnegative().optional(),
    quantity: z.number().int().nonnegative().optional(),
    reorderLevel: z.number().int().nonnegative().optional(),
    images: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    dateAdded: z.string().optional(),
    isActive: z.boolean().optional()
  })
});

const productUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    sku: z.string().min(3).optional(),
    partNumber: z.string().min(3).optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    supplier: z.string().optional(),
    description: z.string().optional(),
    price: z.number().nonnegative().optional(),
    sellingPrice: z.number().nonnegative().optional(),
    costPrice: z.number().nonnegative().optional(),
    buyingPrice: z.number().nonnegative().optional(),
    stockQty: z.number().int().nonnegative().optional(),
    quantity: z.number().int().nonnegative().optional(),
    reorderLevel: z.number().int().nonnegative().optional(),
    images: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    dateAdded: z.string().optional(),
    isActive: z.boolean().optional()
  })
});

module.exports = { productSchema, productUpdateSchema };
