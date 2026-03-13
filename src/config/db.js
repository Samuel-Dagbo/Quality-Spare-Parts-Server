const mongoose = require("mongoose");

const connectDb = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set");
  }
  mongoose.set("strictQuery", true);

  mongoose.connection.on("connected", () => {
    // eslint-disable-next-line no-console
    console.log("MongoDB connected");
  });

  mongoose.connection.on("error", (err) => {
    // eslint-disable-next-line no-console
    console.error("MongoDB connection error", err);
  });

  mongoose.connection.on("disconnected", () => {
    // eslint-disable-next-line no-console
    console.warn("MongoDB disconnected");
  });

  await mongoose.connect(uri);
};

module.exports = connectDb;
