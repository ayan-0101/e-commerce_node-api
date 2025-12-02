const orderService = require('../services/order.service');

/**
 * @desc Get all orders (Admin only) - paginated
 * Query params:
 *   pageNumber (default 1)
 *   pageSize   (default 10)
 *   status     (optional, e.g. PENDING, DELIVERED)
 *   userId     (optional filter by user)
 */
const getAllOrders = async (req, res) => {
  try {
    const ordersPage = await orderService.allOrders(req.query); 

    return res.status(200).json({
      success: true,
      message: "All orders fetched successfully",
      data: ordersPage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching orders",
    });
  }
};

/**
 * @desc Get single order by ID (Admin or User)
 */
const getOrderById = async (req, res) => {
  try {
    const order = await orderService.findOrderById(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message || "Order not found",
    });
  }
};

/**
 * @desc Get all orders for the logged-in user (Order history) - paginated
 * Query params:
 *   pageNumber (default 1)
 *   pageSize   (default 10)
 *   status     (optional, e.g. DELIVERED)
 */
const getUserOrderHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const ordersPage = await orderService.userOrderHistory(userId, req.query);

    return res.status(200).json({
      success: true,
      message: "User order history fetched successfully",
      // ordersPage = { content, currentPage, totalPages, totalElements }
      data: ordersPage,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message || "No order history found for this user",
    });
  }
};

/**
 * @desc Create a new order for a user
 */
const createOrder = async (req, res) => {
  try {
    const user = req.user;
    const shippingAddress = req.body; // The entire body contains shipping address data

    const newOrder = await orderService.createOrder(user, shippingAddress);
    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: newOrder,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Error creating order",
    });
  }
};

/**
 * @desc Update order status (Admin use)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const validStatuses = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const updatedOrder = await orderService.updateOrderStatus(
      orderId,
      status,
      status === "PLACED"
    );

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error updating order status",
    });
  }
};

/**
 * @desc Delete an order (Admin)
 */
const deleteOrder = async (req, res) => {
  try {
    await orderService.deleteOrder(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message || "Order not found",
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  getUserOrderHistory,
  createOrder,
  updateOrderStatus,
  deleteOrder,
};
