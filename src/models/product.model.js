const mongoose = require("mongoose");
const { Category } = require("./category.model");

const productSchema = mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
  },
  discountedPrice: {
    type: Number,
  },
  discountPercentage: {
    type: Number,
  },
  quantity: {
    type: Number,
  },
  brand: {
    type: String,
  },
  color: {
    type: String,
  },
  size: [
    {
      name: { type: String },
      quantity: { type: Number },
    },
  ],

  imageUrl: {
    type: String,
  },

  ratings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ratings",
    },
  ],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "reviews",
    },
  ],

  numRatings: {
    type: Number,
    default: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "categories",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Product = mongoose.model("products", productSchema);
module.exports = { Product };
