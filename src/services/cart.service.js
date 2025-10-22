const { Cart } = require("../models/cart.model");
const { CartItem } = require("../models/cartItem.model");
const { Product } = require("../models/product.model");

/**
 * Create a new cart for a user
 * @param {ObjectId} user - MongoDB userId
 * @returns {Object} Created cart document
 */
const createCart = async (user) => {
  const userId = user && user._id ? user._id : user;

  if (!userId) {
    throw new Error("Invalid user provided to createCart");
  }

  const existingCart = await Cart.findOne({ user: userId });
  if (existingCart) return existingCart;

  const cart = new Cart({
    user: userId,
    cartItems: [],
    totalPrice: 0,
    totalItem: 0,
    totalDiscountedPrice: 0,
    discount: 0,
  });

  await cart.save();
  return cart;
};

const findUserCart = async (userId) => {
  try {
    let cart = await Cart.findOne({ user: userId }).lean();

    if (!cart) {
      const err = new Error("Cart not found");
      err.status = 404;
      throw err;
    }

    // Fetch cart items with populated product
    const cartItems = await CartItem.find({ cart: cart._id }).populate("product").lean();
    
    // Replace the IDs array with full cartItem objects
    cart.cartItems = cartItems;

    let totalPrice = 0;
    let totalDiscountedPrice = 0;
    let totalItem = 0;

    for (const item of cart.cartItems) {
      totalPrice += item.price || 0;
      totalDiscountedPrice += item.discountedPrice || 0;
      totalItem += item.quantity || 0;
    }

    cart.totalPrice = totalPrice;
    cart.totalDiscountedPrice = totalDiscountedPrice;
    cart.discount = totalPrice - totalDiscountedPrice;
    cart.totalItem = totalItem;

    return cart;
  } catch (error) {
    console.error("Error fetching cart:", error.message);
    throw error;
  }
};

const addItemToCart = async (userId, req) => {
  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error("Cart not found");

    const product = await Product.findById(req.productId);
    if (!product) throw new Error("Product not found");

    // Check if item with same product and size already exists
    const isPresent = await CartItem.findOne({
      cart: cart._id,
      product: product._id,
      userId,
      size: req.size,
    });

    if (!isPresent) {
      const cartItem = new CartItem({
        product: product._id,
        cart: cart._id,
        quantity: 1,
        userId,
        price: product.price,
        size: req.size,
        discountedPrice: product.discountedPrice,
      });

      const createdCartItem = await cartItem.save();
      
      // Push the cartItem ID to the cart's cartItems array
      cart.cartItems.push(createdCartItem._id);
      await cart.save();
      
      // Return the cart with populated items
      return await findUserCart(userId);
    }

    return "Item already in cart";
  } catch (error) {
    console.error("Error adding item to cart:", error.message);
    throw error;
  }
};

module.exports = { createCart, findUserCart, addItemToCart };