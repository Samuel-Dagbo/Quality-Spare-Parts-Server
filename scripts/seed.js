require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDb = require("../src/config/db");
const User = require("../src/models/User");
const Category = require("../src/models/Category");
const Brand = require("../src/models/Brand");
const Supplier = require("../src/models/Supplier");
const Product = require("../src/models/Product");

const seedCategories = [
  { name: "Braking", slug: "braking", description: "Brake pads, rotors, hydraulics" },
  { name: "Engine", slug: "engine", description: "Filters, belts, gaskets" },
  { name: "Suspension", slug: "suspension", description: "Shocks, struts, arms" },
  { name: "Electrical", slug: "electrical", description: "Sensors, batteries, lighting" },
  { name: "Cooling", slug: "cooling", description: "Radiators, fans, thermostats" }
];

const seedBrands = [
  { name: "Zenith", slug: "zenith" },
  { name: "TorquePro", slug: "torquepro" },
  { name: "RideX", slug: "ridex" },
  { name: "VoltEdge", slug: "voltedge" }
];

const seedSuppliers = [
  {
    name: "Atlas Auto Supply",
    contactName: "Sales Desk",
    phone: "+233 50 000 0000",
    email: "sales@atlasauto.com",
    address: "Accra Industrial Zone"
  },
  {
    name: "TorquePro Distribution",
    contactName: "Orders",
    phone: "+233 55 000 0000",
    email: "orders@torquepro.io",
    address: "Tema Port"
  }
];

const seedProducts = [
  {
    name: "Ceramic Brake Pads",
    sku: "BRK-3321",
    partNumber: "BRK-3321",
    description: "Low-dust ceramic pads",
    price: 68,
    sellingPrice: 68,
    costPrice: 40,
    buyingPrice: 40,
    stockQty: 24,
    quantity: 24,
    reorderLevel: 8,
    tags: ["brake", "pads", "ceramic"],
    images: [
      "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    name: "Premium Oil Filter",
    sku: "OIL-8831",
    partNumber: "OIL-8831",
    description: "High flow oil filter",
    price: 18,
    sellingPrice: 18,
    costPrice: 9,
    buyingPrice: 9,
    stockQty: 120,
    quantity: 120,
    reorderLevel: 25,
    tags: ["oil", "filter", "engine"],
    images: [
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    name: "Shock Absorber Set",
    sku: "SUS-2198",
    partNumber: "SUS-2198",
    description: "Gas charged shocks",
    price: 180,
    sellingPrice: 180,
    costPrice: 110,
    buyingPrice: 110,
    stockQty: 8,
    quantity: 8,
    reorderLevel: 5,
    tags: ["shock", "suspension"],
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    name: "Radiator Cooling Fan",
    sku: "COL-5520",
    partNumber: "COL-5520",
    description: "High-performance cooling fan",
    price: 220,
    sellingPrice: 220,
    costPrice: 150,
    buyingPrice: 150,
    stockQty: 14,
    quantity: 14,
    reorderLevel: 6,
    tags: ["cooling", "fan"],
    images: [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    name: "Alternator Assembly",
    sku: "ELE-7102",
    partNumber: "ELE-7102",
    description: "Reliable 12V alternator",
    price: 340,
    sellingPrice: 340,
    costPrice: 240,
    buyingPrice: 240,
    stockQty: 6,
    quantity: 6,
    reorderLevel: 3,
    tags: ["electrical", "alternator"],
    images: [
      "https://images.unsplash.com/photo-1462396881884-de2c07cb95ed?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    name: "Timing Belt Kit",
    sku: "ENG-4033",
    partNumber: "ENG-4033",
    description: "Complete timing belt replacement kit",
    price: 260,
    sellingPrice: 260,
    costPrice: 180,
    buyingPrice: 180,
    stockQty: 10,
    quantity: 10,
    reorderLevel: 4,
    tags: ["engine", "belt"],
    images: [
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=900&q=80"
    ]
  }
];

const ensureUser = async ({
  name,
  email,
  password,
  role,
  phone = "",
  address = ""
}) => {
  const existing = await User.findOne({ email });
  if (existing) return existing;

  const passwordHash = await bcrypt.hash(password, 10);
  return User.create({
    name,
    email,
    passwordHash,
    role,
    phone,
    address: address ? { line1: address } : undefined,
    isActive: true
  });
};

const seedUsers = async () => {
  await ensureUser({
    name: process.env.ADMIN_NAME || "Admin User",
    email: process.env.ADMIN_EMAIL || "admin@spareparts.local",
    password: process.env.ADMIN_PASSWORD || "ChangeMe123!",
    role: "admin"
  });

  await ensureUser({
    name: process.env.STAFF_NAME || "Staff User",
    email: process.env.STAFF_EMAIL || "staff@spareparts.local",
    password: process.env.STAFF_PASSWORD || "ChangeMe123!",
    role: "staff"
  });

  await ensureUser({
    name: process.env.CUSTOMER_NAME || "Customer User",
    email: process.env.CUSTOMER_EMAIL || "customer@spareparts.local",
    password: process.env.CUSTOMER_PASSWORD || "ChangeMe123!",
    role: "customer",
    phone: "+233 55 111 1111",
    address: "Accra Central"
  });
};

const upsertMany = async (Model, docs, key) => {
  for (const doc of docs) {
    await Model.updateOne({ [key]: doc[key] }, { $setOnInsert: doc }, { upsert: true });
  }
};

const seed = async () => {
  try {
    await connectDb();
    await seedUsers();

    await upsertMany(Category, seedCategories, "slug");
    await upsertMany(Brand, seedBrands, "slug");
    await upsertMany(Supplier, seedSuppliers, "name");

    const categories = await Category.find();
    const brands = await Brand.find();
    const suppliers = await Supplier.find();

    for (const product of seedProducts) {
      const category = categories.find((c) => product.tags?.includes(c.slug)) || categories[0];
      const brand = brands[0];
      const supplier = suppliers[0];
      await Product.updateOne(
        { sku: product.sku },
        {
          $setOnInsert: {
            ...product,
            category: category?._id,
            brand: brand?._id,
            supplier: supplier?._id,
            dateAdded: new Date()
          }
        },
        { upsert: true }
      );
    }

    // eslint-disable-next-line no-console
    console.log("Seed complete");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Seed failed", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
