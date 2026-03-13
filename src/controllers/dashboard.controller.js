const Order = require("../middleware/models/Order");
const Product = require("../middleware/models/Product");
const Sale = require("../middleware/models/Sale");

const getStats = async (req, res) => {
  const [pendingOrdersCount, lowStockProducts] = await Promise.all([
    Order.countDocuments({ status: "pending" }),
    Product.countDocuments({ stockQty: { $lte: 5 } })
  ]);

  res.json({
    data: {
      pendingOrders: pendingOrdersCount,
      lowStockCount: lowStockProducts,
    }
  });
};

const getReports = async (req, res) => {
  const { period = "today" } = req.query;
  const now = new Date();
  let startDate;

  switch (period) {
    case "today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      startDate = new Date(0);
  }

  const [orders, sales] = await Promise.all([
    Order.find({ status: { $ne: "cancelled" }, createdAt: { $gte: startDate } }).lean(),
    Sale.find({ createdAt: { $gte: startDate } }).lean()
  ]);

  const totalRevenue = orders.reduce((sum, order) => sum + order.grandTotal, 0) +
    sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

  const orderCount = orders.length;
  const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

  const topProducts = new Map();
  orders.forEach(order => order.items.forEach(item => {
    const key = item.product || item.sku;
    const current = topProducts.get(key) || { qty: 0, revenue: 0 };
    topProducts.set(key, { qty: current.qty + item.quantity, revenue: current.revenue + (item.price * item.quantity) });
  }));
  sales.forEach(sale => sale.items.forEach(item => {
    const key = item.product;
    const current = topProducts.get(key) || { qty: 0, revenue: 0 };
    topProducts.set(key, { qty: current.qty + item.quantity, revenue: current.revenue + (item.sellingPrice * item.quantity) });
  }));

  const topProductsList = Array.from(topProducts.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const staffSales = new Map();
  sales.forEach(sale => {
    const key = sale.createdBy?.name || "Unknown";
    const current = staffSales.get(key) || { orders: 0, revenue: 0 };
    staffSales.set(key, { orders: current.orders + 1, revenue: current.revenue + sale.totalAmount });
  });

  const salesByStaff = Array.from(staffSales.entries())
    .map(([name, data]) => ({ _id: name, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  res.json({
    data: {
      period,
      totalRevenue,
      orderCount,
      avgOrderValue,
      topProducts: topProductsList,
      salesByStaff
    }
  });
};

module.exports = { getStats, getReports };

