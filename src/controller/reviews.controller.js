const reviewService = require("../services/review.service");

/**
 * @desc Create a new review for a product
 */
const createReview = async (req, res) => {
  try {
    const user = req.user; // assuming user is attached to req by auth middleware
    const reviewData = req.body;

    const newReview = await reviewService.createReview(reviewData, user);
    return res.status(201).json(newReview);
  } catch (error) {
    console.error("Error creating review:", error.message);
    return res.status(400).json({ message: error.message || "Failed to create review" });
  }
};

/**
 * @desc Get all reviews for a given product
 */
const getAllReviews = async (req, res) => {
  try {
    const productId = req.params.productId;
    const reviews = await reviewService.getAllReviews(productId);
    return res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error.message);
    return res.status(404).json({ message: error.message || "Reviews not found" });
  }
};

module.exports = {
  createReview,
  getAllReviews,
};
