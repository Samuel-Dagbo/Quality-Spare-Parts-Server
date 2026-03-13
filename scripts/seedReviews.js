require("dotenv").config();
const mongoose = require("mongoose");
const Review = require("../src/middleware/models/Review");
const User = require("../src/middleware/models/User");
const Product = require("../src/middleware/models/Product");
const connectDb = require("../src/config/db");

const sampleReviews = [
  { rating: 5, comment: "Excellent quality parts, fitted perfectly in my Toyota.", approved: true },
  { rating: 5, comment: "Delivery was super fast to Kumasi. Highly recommended!", approved: true },
  { rating: 4, comment: "Good price, packaging could be better but item is safe.", approved: true },
  { rating: 5, comment: "Genuine OEM parts as described. Will buy again.", approved: true },
  { rating: 4, comment: "Customer service helped me find the right SKU.", approved: true },
  { rating: 5, comment: "The brake pads are top notch. Very quiet.", approved: true },
  { rating: 3, comment: "Okay product, but delivery took longer than expected.", approved: true },
  { rating: 5, comment: "Perfect fit for my 2015 Honda Civic.", approved: true }
];

const seedReviews = async () => {
  try {
    await connectDb();
    console.log("Connected to DB...");

    const users = await User.find({ role: "customer" });
    const products = await Product.find({});

    if (users.length === 0 || products.length === 0) {
      console.log("Error: Need at least one user and one product in the database to seed reviews.");
      process.exit(1);
    }

    // Clear existing reviews to avoid duplicates during seeding
    await Review.deleteMany({});
    console.log("Cleared existing reviews.");

    const reviewsToCreate = [];

    // Create 15 random reviews
    for (let i = 0; i < 15; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      const template = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];

      reviewsToCreate.push({
        user: user._id,
        product: product._id,
        rating: template.rating,
        comment: template.comment,
        approved: template.approved
      });
    }

    try {
      await Review.insertMany(reviewsToCreate, { ordered: false });
    } catch (insertError) {
      console.log(`Inserted some reviews, ignoring duplicates: ${insertError.message}`);
    }
    console.log(`Successfully created ${reviewsToCreate.length} reviews.`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding reviews:", error);
    process.exit(1);
  }
};

seedReviews();
