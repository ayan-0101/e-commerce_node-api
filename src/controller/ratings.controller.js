const ratingService = require("../services/rating.service");

/**
 * @desc Create a new rating for a product
 */
const createRating = async (req, res) => {
  try {
    const user = req.user; // assuming user is attached via auth middleware
    const ratingData = req.body;

    const newRating = await ratingService.createRating(ratingData, user);
    return res.status(201).json(newRating);
  } catch (error) {
    console.error("Error creating rating:", error.message);
    return res.status(400).json({ message: error.message || "Failed to create rating" });
  }
};

/**
 * @desc Get all ratings for a specific product
 */
const getProductRating = async (req, res) => {
  try {
    const productId = req.params.productId;
    const ratings = await ratingService.getProductRating(productId);
    return res.status(200).json(ratings);
  } catch (error) {
    console.error("Error fetching ratings:", error.message);
    return res.status(404).json({ message: error.message || "Ratings not found" });
  }
};

module.exports = {
  createRating,
  getProductRating,
};
