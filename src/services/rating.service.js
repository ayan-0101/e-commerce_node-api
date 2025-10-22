// Import required models and services
const Rating = require("../models/rating.model.js");
const productService = require("../services/product.service.js");

/**
 * @desc Creates a new rating for a specific product by a user
 * @param {Object} req - Request data containing productId and rating
 * @param {Object} user - The user who is rating the product
 * @returns {Promise<Object>} - The created rating document
 */
async function createRating(req, user) {
  // 1️⃣ Fetch the product using productId from request
  const product = await productService.findProductById(req.productId);
  if (!product) {
    throw new Error("Product not found");
  }

  // 2️⃣ Create a new Rating document
  const rating = new Rating({
    product: product._id,
    user: user._id,
    rating: req.rating,
    createdAt: new Date(),
  });

  // 3️⃣ Save and return the created rating
  return await rating.save();
}

/**
 * @desc Retrieves all ratings for a given product
 * @param {String} productId - The product's ID
 * @returns {Promise<Array>} - Array of ratings for that product
 */
async function getProductRating(productId) {
  // Validate product existence before fetching ratings
  const product = await productService.findProductById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  // Fetch all ratings for the given product
  return await Rating.find({ product: productId }).populate("user", "name email");
}

// Export all functions
module.exports = {
  createRating,
  getProductRating,
};
