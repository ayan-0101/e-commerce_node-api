
const express = require("express");
const route = express.Router();
const cartItemController = require("../controller/cartItem.controller");
const { authenticate } = require("../middleware/authenticate.js"); 

// Routes
route.put("/:id", authenticate, cartItemController.updateCartItem);
route.delete("/:id", authenticate, cartItemController.removeCartItem);

module.exports = route;
