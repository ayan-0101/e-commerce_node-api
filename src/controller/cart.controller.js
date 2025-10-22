const cartService = require("../services/cart.service");

/**
 * Create a new cart for the authenticated user
 */
const createCart = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized - user missing' });

    const cart = await cartService.createCart(req.user);

    res.status(201).json({
      success: true,
      message: "Cart created successfully",
      data: cart,
    });
  } catch (error) {
    const status = error && error.status ? error.status : 500;
    res.status(status).json({ success: false, message: error.message || "Failed to create cart" });
  }
};

/**
 * Get the authenticated user's cart
 */
const getUserCart = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized - user missing' });

    const userId = req.user._id;
    let cart;
    try {
      cart = await cartService.findUserCart(userId);
    } catch (err) {
      // If cart not found, create a new empty cart and return it
      if (err && err.message && err.message.includes('Cart not found')) {
        cart = await cartService.createCart(req.user);
      } else {
        throw err;
      }
    }

    res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: cart,
    });
  } catch (error) {
    const status = error && error.status ? error.status : 500;
    res.status(status).json({ success: false, message: error.message || "Cart not found" });
  }
};

/**
 * Add an item to the authenticated user's cart
 */
const addItemToCart = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized - user missing' });

    const userId = req.user._id;
    let result;
    try {
      result = await cartService.addItemToCart(userId, req.body);
    } catch (err) {
      if (err && err.message && err.message.includes('Cart not found')) {
        // create cart and retry
        await cartService.createCart(req.user);
        result = await cartService.addItemToCart(userId, req.body);
      } else {
        throw err;
      }
    }

    res.status(200).json({
      success: true,
      message: result,
    });
  } catch (error) {
    // Map known statuses, default to 400 for bad requests
    const status = error && error.status ? error.status : 400;
    res.status(status).json({ success: false, message: error.message || "Failed to add item to cart" });
  }
};

module.exports = {
  createCart,
  getUserCart,
  addItemToCart,
};
