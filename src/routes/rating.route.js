
const express = require("express");
const route = express.Router();
const ratingController = require("../controller/ratings.controller");
const { authenticate } = require("../middleware/authenticate.js"); // Adjust path as needed

// Routes
route.post("/create", authenticate, ratingController.createRating);
route.get("/product/:productId", ratingController.getProductRating);

module.exports = route;