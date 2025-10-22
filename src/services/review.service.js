// Import required modules
const Review = require('../models/review.model');
const productService = require('./product.service');

/**
 * @desc Creates a new review for a product by a user
 * @param {Object} reqData - Contains review details (product ID, review text)
 * @param {Object} user - The user creating the review
 * @returns {Promise<Object>} - The created review document
 */
const createReview = async (reqData, user) => {
  // Fetch the product using productId from request
  const product = await productService.findProductById(reqData.product);
  if (!product) {
    throw new Error('Product not found');
  }

  // Create a new Review document
  const review = new Review({
    user: user._id,
    product: reqData.product,
    review: reqData.review,
    createdAt: Date.now(),
  });
  
  // Save and return the created review
  return await review.save();
};

/**
 * @desc Retrieves all reviews for a given product
 * @param {String} productId - The product's ID
 * @returns {Promise<Array>} - Array of review documents with user details populated
 */
const getAllReviews = async (productId) => {
  // Validate that the product exists
  const product = await productService.findProductById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  // Fetch and populate reviews with user details
  return await Review.find({ product: productId })
    .populate('user', 'name email') // populate only necessary user fields
    .sort({ createdAt: -1 }); // sort newest first
};

module.exports = { createReview, getAllReviews };
