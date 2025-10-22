const express = require("express");
const route = express.Router();
const cartController = require("../controller/cart.controller");
const { authenticate } = require("../middleware/authenticate.js"); // Adjust path as needed

// Routes
route.post("/", authenticate, cartController.createCart);
route.get("/", authenticate, cartController.getUserCart);
route.put("/add", authenticate, cartController.addItemToCart);

module.exports = route;
