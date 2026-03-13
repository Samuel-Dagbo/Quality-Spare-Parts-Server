const Order = require("../middleware/models/Order");
const Sale = require("../middleware/models/Sale");
const Product = require("../middleware/models/Product");

const buildDateKey = (date) => date.toISOString().slice(0, 10);

const groupByDay = (records) => {
  const map = new Map();
  records.forEach((rec) => {
    const key = buildDateKey(new Date(rec.date));
    map.set(key, (map.get(key) || 0) + rec.amount);
  });
  return Array.from(map.entries())
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([date, total]) => ({ date, total }));
};

const groupByMonth = (records) => {
  const map = new Map();
  records.forEach((rec) => {
    const d = new Date(rec.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) || 0) + rec.amount);
  });
  return Array.from(map.entries())
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([period, total]) => ({ period, total }));
};

const groupByYear = (records) => {
  const map = new Map();
  records.forEach((rec) => {
    const d = new Date(rec.date);
    const key = `${d.getFullYear()}`;
    map.set(key, (map.get(key) || 0) + rec.amount);
  });
  return Array.from(map.entries())
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([year, total]) => ({ year, total }));
};

const getAnalyticsSummary = async (req, res) => {
  const sales = await Sale.find().lean();
  const orders = await Order.find().lean();

  const revenueRecords = [
    ...sales.map((sale) => ({ date: sale.saleDate, amount: sale.totalAmount })),
    ...orders.map((order) => ({ date: order.createdAt, amount: order.grandTotal }))
  ];

  const dailySales = groupByDay(revenueRecords);
  const monthlySales = groupByMonth(revenueRecords);
  const yearlySales = groupByYear(revenueRecords);

  const productMap = new Map();
  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      const key = item.product.toString();
      const current = productMap.get(key) || { qty: 0, revenue: 0 };
      productMap.set(key, {
        qty: current.qty + item.quantity,
        revenue: current.revenue + item.sellingPrice * item.quantity
      });
    });
  });
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const key = item.product?.toString() || item.sku;
      const current = productMap.get(key) || { qty: 0, revenue: 0 };
      productMap.set(key, {
        qty: current.qty + item.quantity,
        revenue: current.revenue + item.price * item.quantity
      });
    });
  });

  const bestSelling = Array.from(productMap.entries())
    .map(([productId, data]) => ({ productId, ...data }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const products = await Product.find().lean();
  const inventoryValue = products.reduce(
    (sum, p) => sum + (p.costPrice || p.buyingPrice || 0) * (p.stockQty || 0),
    0
  );

  const lowStock = products
    .filter((p) => (p.stockQty || 0) <= (p.reorderLevel || 0))
    .slice(0, 10)
    .map((p) => ({
      id: p._id,
      name: p.name,
      stockQty: p.stockQty
    }));

  const customerMap = new Map();
  orders.forEach((order) => {
    const key = order.customerInfo?.email || order.user?.toString() || "guest";
    customerMap.set(key, (customerMap.get(key) || 0) + 1);
  });
  sales.forEach((sale) => {
    const key = sale.customerContact || sale.customerName;
    customerMap.set(key, (customerMap.get(key) || 0) + 1);
  });

  const mostActiveCustomers = Array.from(customerMap.entries())
    .map(([customer, count]) => ({ customer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  let profit = 0;
  for (const sale of sales) {
    for (const item of sale.items) {
      const product = products.find((p) => p._id.toString() === item.product.toString());
      const cost = product?.costPrice || product?.buyingPrice || 0;
      profit += (item.sellingPrice - cost) * item.quantity;
    }
  }

  const revenue = revenueRecords.reduce((sum, rec) => sum + rec.amount, 0);

  res.json({
    data: {
      dailySales,
      monthlySales,
      yearlySales,
      bestSelling,
      mostActiveCustomers,
      inventoryValue,
      lowStock,
      profit,
      revenue
    }
  });
};

const serializeProduct = (product) => ({
  _id: product._id,
  name: product.name,
  sku: product.sku,
  partNumber: product.partNumber,
  price: product.price,
  images: product.images || [],
  category: product.category
    ? { _id: product.category._id, name: product.category.name, slug: product.category.slug }
    : undefined,
  brand: product.brand ? { _id: product.brand._id, name: product.brand.name, slug: product.brand.slug } : undefined,
  stockQty: product.stockQty ?? 0
});

// Public storefront highlights: top sellers from historical activity + most recent products.
const getStoreHighlights = async (req, res) => {
  const [sales, orders] = await Promise.all([
    Sale.find().select("items saleDate").lean(),
    Order.find({ status: { $ne: "cancelled" } }).select("items createdAt").lean()
  ]);

  const productTally = new Map();
  const tally = (productId, quantity, unitPrice) => {
    if (!productId) return;
    const key = productId.toString();
    const qty = Number(quantity) || 0;
    const price = Number(unitPrice) || 0;
    const current = productTally.get(key) || { qty: 0, revenue: 0 };
    productTally.set(key, {
      qty: current.qty + qty,
      revenue: current.revenue + price * qty
    });
  };

  sales.forEach((sale) => {
    sale.items.forEach((item) => tally(item.product, item.quantity, item.sellingPrice));
  });
  orders.forEach((order) => {
    order.items.forEach((item) => tally(item.product, item.quantity, item.price));
  });

  const bestSellingEntries = Array.from(productTally.entries())
    .map(([productId, data]) => ({ productId, ...data }))
    .sort((a, b) => b.qty - a.qty || b.revenue - a.revenue)
    .slice(0, 6);

  const bestSellingIds = bestSellingEntries.map((item) => item.productId);
  const [bestProducts, newArrivals] = await Promise.all([
    Product.find({ _id: { $in: bestSellingIds }, isActive: true })
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .lean(),
    Product.find({ isActive: true })
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean()
  ]);

  const bestMap = new Map(bestProducts.map((p) => [p._id.toString(), serializeProduct(p)]));
  const bestSellers = bestSellingEntries
    .map((entry) => {
      const product = bestMap.get(entry.productId);
      if (!product) return null;
      return {
        product,
        qtySold: entry.qty,
        revenue: entry.revenue
      };
    })
    .filter(Boolean);

  res.json({
    data: {
      bestSellers,
      newArrivals: newArrivals.map(serializeProduct)
    }
  });
};

module.exports = { getAnalyticsSummary, getStoreHighlights };
