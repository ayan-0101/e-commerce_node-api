const {Order} = require("../models/order.model");
const {Cart} = require("../models/cart.model");
const {CartItem} = require("../models/cartItem.model");
const {Address} = require("../models/address.model");

/**
 * 🛒 Create a new order for the user
 */
const createOrder = async (user, shippingAddressData) => {
  try {
    const cart = await Cart.findOne({ user: user._id });
    if (!cart) throw new Error("Cart not found");

    const cartItems = await CartItem.find({ cart: cart._id }).populate("product");
    if (!cartItems || cartItems.length === 0) throw new Error("Cart is empty");

    let totalPrice = 0;
    let totalDiscountedPrice = 0;
    let totalItem = 0;

    for (const item of cartItems) {
      totalPrice += item.price * item.quantity;
      totalDiscountedPrice += item.discountedPrice * item.quantity;
      totalItem += item.quantity;
    }

    const discount = totalPrice - totalDiscountedPrice;

    // Validate required shipping address fields
    const requiredFields = ['firstName', 'lastName', 'streetAddress', 'city', 'state', 'zipCode', 'mobile'];
    for (const field of requiredFields) {
      if (!shippingAddressData[field]) {
        throw new Error(`${field} is required in shipping address`);
      }
    }

    // Create shipping address
    const shippingAddress = new Address({
      firstName: shippingAddressData.firstName,
      lastName: shippingAddressData.lastName,
      streetAddress: shippingAddressData.streetAddress,
      city: shippingAddressData.city,
      state: shippingAddressData.state,
      zipCode: shippingAddressData.zipCode,
      mobile: shippingAddressData.mobile,
      user: user._id
    });
    const savedAddress = await shippingAddress.save();

    // Create new order items from cart items
    const { OrderItems } = require("../models/orderItems.model");
    const orderItemsPromises = cartItems.map(async (cartItem) => {
      const orderItem = new OrderItems({
        product: cartItem.product._id,
        size: cartItem.size,
        quantity: cartItem.quantity,
        price: cartItem.price,
        discountedPrice: cartItem.discountedPrice,
        userId: user._id
      });
      return await orderItem.save();
    });

    const savedOrderItems = await Promise.all(orderItemsPromises);

    const order = new Order({
      user: user._id,
      orderItems: savedOrderItems.map(item => item._id),
      orderDate: new Date(),
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      shippingAddress: savedAddress._id,
      totalPrice,
      totalDiscountedPrice,
      discount,
      totalItem,
      paymentDetails: {
        paymentMethod: "PENDING",
        paymentStatus: "PENDING",
      },
    });

    const savedOrder = await order.save();

    // ✅ Clear the cart
    cart.cartItems = [];
    cart.totalPrice = 0;
    cart.totalItem = 0;
    cart.totalDiscountedPrice = 0;
    cart.discount = 0;
    await cart.save();

    // Populate the complete order with all references
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate("user", "firstName lastName email")
      .populate("shippingAddress")
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          select: "title price imageUrl brand"
        }
      });

    return populatedOrder;
  } catch (error) {
    console.error("Error creating order:", error.message);
    throw error;
  }
};

/**
 * 📜 Get all orders (Admin)
 */
const allOrders = async () => {
  return await Order.find()
    .populate("user", "firstName lastName email")
    .populate({
      path: "orderItems",
      populate: { path: "product" },
    })
    .sort({ orderDate: -1 });
};

/**
 * 👤 Get single order by ID
 */
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

/**
 * 🧾 Get user's order history
 */
const userOrderHistory = async (userId) => {
  return await Order.find({ user: userId })
    .populate({
      path: "orderItems",
      populate: { path: "product" },
    })
    .sort({ orderDate: -1 });
};

/**
 * 🚚 Update order status (Admin)
 */
const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");
  order.orderStatus = status;
  await order.save();
  return order;
};

/**
 * ❌ Delete an order (Admin)
 */
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
