const { Order } = require("../models/order.model");
const { Cart } = require("../models/cart.model");
const { CartItem } = require("../models/cartItem.model");
const { Address } = require("../models/address.model");
const { OrderItems } = require("../models/orderItems.model");


const createOrder = async (user, shippingAddressData) => {
  // ... your existing createOrder code unchanged ...
};

const allOrders = async (reqQuery = {}) => {
  let {
    pageNumber = 1,
    pageSize = 10,
    status,
    userId,
  } = reqQuery;

  pageNumber = Number(pageNumber) || 1;
  pageSize = Number(pageSize) || 10;

  const filter = {};

  if (status) {
    // e.g. ?status=PENDING
    filter.orderStatus = status;
  }

  if (userId) {
    // optional filter by specific user (admin side)
    filter.user = userId;
  }

  let query = Order.find(filter)
    .populate("user", "firstName lastName email")
    .populate({
      path: "orderItems",
      populate: { path: "product" },
    })
    .sort({ orderDate: -1 });

  // count before pagination
  const totalElements = await Order.countDocuments(filter);
  const skip = (pageNumber - 1) * pageSize;

  const orders = await query.skip(skip).limit(pageSize).exec();
  const totalPages = Math.ceil(totalElements / pageSize) || 1;

  return {
    orders: orders,
    currentPage: pageNumber,
    totalPages,
    totalElements,
  };
};

/**
 * 👤 Get user's order history with pagination
 * @param {String|ObjectId} userId
 * @param {Object} reqQuery - supports pageNumber, pageSize, status
 */
const userOrderHistory = async (userId, reqQuery = {}) => {
  let {
    pageNumber = 1,
    pageSize = 10,
    status,
  } = reqQuery;

  pageNumber = Number(pageNumber) || 1;
  pageSize = Number(pageSize) || 10;

  const filter = { user: userId };

  if (status) {
    filter.orderStatus = status;
  }

  let query = Order.find(filter)
    .populate({
      path: "orderItems",
      populate: { path: "product" },
    })
    .sort({ orderDate: -1 });

  const totalElements = await Order.countDocuments(filter);
  const skip = (pageNumber - 1) * pageSize;

  const orders = await query.skip(skip).limit(pageSize).exec();
  const totalPages = Math.ceil(totalElements / pageSize) || 1;

  return {
    orders: orders,
    currentPage: pageNumber,
    totalPages,
    totalElements,
  };
};


const findOrderById = async (id) => {
  const order = await Order.findById(id)
    .populate("user", "firstName lastName email")
    .populate("shippingAddress")
    .populate({
      path: "orderItems",
      populate: { path: "product" },
    });
  if (!order) throw new Error("Order not found");
  return order;
};


const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");
  order.orderStatus = status;
  await order.save();
  return order;
};


const deleteOrder = async (id) => {
  const deletedOrder = await Order.findByIdAndDelete(id);
  if (!deletedOrder) throw new Error("Order not found");
  return deletedOrder;
};

module.exports = {
  createOrder,
  allOrders,
  findOrderById,
  userOrderHistory,
  updateOrderStatus,
  deleteOrder,
};
