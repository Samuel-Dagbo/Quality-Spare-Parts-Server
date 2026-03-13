﻿const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const { errorHandler } = require("./middleware/error");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const brandRoutes = require("./routes/brand.routes");
const supplierRoutes = require("./routes/supplier.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const userRoutes = require("./routes/user.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const uploadRoutes = require("./routes/upload.routes");
const saleRoutes = require("./routes/sale.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const reviewRoutes = require("./routes/review.routes");

const app = express();

app.use(helmet());
const corsOrigin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.replace(/\/$/, "") : "*";
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "SpareParts API" });
});

app.get("/api/health", (req, res) => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };
  const readyState = mongoose.connection.readyState;
  res.json({
    status: "ok",
    db: {
      state: states[readyState] || "unknown",
      readyState
    },
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reviews", reviewRoutes);

app.use(errorHandler);

module.exports = app;
