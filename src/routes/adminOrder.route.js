const express = require("express");
const route = express.Router();
const adminOrderController = require("../controller/adminOrder.controller");
const { authenticate } = require("../middleware/authenticate.js"); // Adjust path as needed

// Admin routes - all require authentication and admin privileges
route.get("/", authenticate, adminOrderController.getAllOrders);
route.get("/:id", authenticate, adminOrderController.getOrderById);
route.put("/status", authenticate, adminOrderController.updateOrderStatus);
route.delete("/:id", authenticate, adminOrderController.deleteOrder);

module.exports = route;