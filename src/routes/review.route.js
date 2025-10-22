
const express = require("express");
const route = express.Router();
const reviewController = require("../controller/reviews.controller");
const { authenticate } = require("../middleware/authenticate.js"); // Adjust path as needed

// Routes
route.post("/create", authenticate, reviewController.createReview);
route.get("/product/:productId", reviewController.getAllReviews);

module.exports = route;