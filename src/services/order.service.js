const { Order } = require("../models/order.model");
const { Cart } = require("../models/cart.model");
const { CartItem } = require("../models/cartItem.model");
const { Address } = require("../models/address.model");
const { OrderItems } = require("../models/orderItems.model");

/**
 * Create a new order from user's cart
 * @param {Object} user - The authenticated user object
 * @param {Object} shippingAddressData - Shipping address details
 * @returns {Object} The created order
 */
const createOrder = async (user, shippingAddressData) => {
  try {
    // 1. Find user's cart
    const cart = await Cart.findOne({ user: user._id });
    
    if (!cart) {
      throw new Error("Cart not found for this user");
    }

    // 2. Get all cart items with product details
    const cartItems = await CartItem.find({ cart: cart._id })
      .populate('product')
      .exec();

    if (!cartItems || cartItems.length === 0) {
      throw new Error("Cart is empty. Please add items before creating an order.");
    }

    // 3. Create shipping address
    const shippingAddress = new Address({
      firstName: shippingAddressData.firstName,
      lastName: shippingAddressData.lastName,
      streetAddress: shippingAddressData.streetAddress,
      city: shippingAddressData.city,
      state: shippingAddressData.state,
      zipCode: shippingAddressData.zipCode,
      mobile: shippingAddressData.mobile,
      user: user._id,
    });

    const savedAddress = await shippingAddress.save();

    // 4. Create order items from cart items
    const orderItemsPromises = cartItems.map(async (cartItem) => {
      const orderItem = new OrderItems({
        product: cartItem.product._id,
        size: cartItem.size,
        quantity: cartItem.quantity,
        price: cartItem.price,
        discountedPrice: cartItem.discountedPrice,
        userId: user._id,
      });
      return await orderItem.save();
    });

    const orderItems = await Promise.all(orderItemsPromises);

    // 5. Calculate totals
    const totalPrice = cart.totalPrice || 0;
    const totalDiscountedPrice = cart.totalDiscountedPrice || 0;
    const discount = cart.discount || 0;
    const totalItem = cart.totalItem || cartItems.length;

    // 6. Create the order
    const order = new Order({
      user: user._id,
      orderItems: orderItems.map(item => item._id),
      totalPrice: totalPrice,
      totalDiscountedPrice: totalDiscountedPrice,
      discount: discount,
      totalItem: totalItem,
      shippingAddress: savedAddress._id,
      orderDate: new Date(),
      orderStatus: "PENDING",
      paymentDetails: {
        paymentMethod: "PENDING",
        paymentStatus: "PENDING",
      },
    });

    const savedOrder = await order.save();

    // 7. Clear the cart after order creation
    await CartItem.deleteMany({ cart: cart._id });
    cart.cartItems = [];
    cart.totalPrice = 0;
    cart.totalItem = 0;
    cart.totalDiscountedPrice = 0;
    cart.discount = 0;
    await cart.save();
    

    // 8. Populate the order before returning
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('user', 'firstName lastName email')
      .populate('shippingAddress')
      .populate({
        path: 'orderItems',
        populate: { path: 'product' }
      });


    return populatedOrder;
  } catch (error) {
    throw error;
  }
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
    filter.orderStatus = status;
  }

  if (userId) {
    filter.user = userId;
  }

  let query = Order.find(filter)
    .populate("user", "firstName lastName email")
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