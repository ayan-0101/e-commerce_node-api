const express = require("express");
const route = express.Router();
const adminOrderController = require("../controller/adminOrder.controller");
const { authenticate } = require("../middleware/authenticate.js"); 

// User order routes
route.post("/", authenticate, adminOrderController.createOrder);
route.get("/user", authenticate, adminOrderController.getOrderById);
route.get("/:id", authenticate, adminOrderController.getOrderById);

module.exports = route;