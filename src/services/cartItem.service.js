// services/cartItem.service.js

const { CartItem } = require("../models/cartItem.model");
const userService = require("./user.service");

/**
 * Finds a cart item by its ID.
 * @param {string} cartItemId - The ID of the cart item.
 * @returns {Promise<object>} - The found cart item document.
 * @throws {Error} - If the cart item is not found.
 */
const findCartItemById = async (cartItemId) => {
  const cartItem = await CartItem.findById(cartItemId).populate("product");
  if (!cartItem) {
    throw new Error(`Cart item not found with ID: ${cartItemId}`);
  }
  return cartItem;
};

/**
 * Updates a cart item (quantity, price, discounted price).
 * @param {string} userId - The ID of the user making the request.
 * @param {string} cartItemId - The ID of the cart item to update.
 * @param {object} cartItemData - The new cart item data (e.g., { quantity }).
 * @returns {Promise<object>} - The updated cart item.
 * @throws {Error} - If user or cart item not found, or not owned by the user.
 */
const updateCartItem = async (userId, cartItemId, cartItemData) => {
  try {
    // Verify the user exists
    const user = await userService.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Find the cart item
    const item = await findCartItemById(cartItemId);

    // Ensure the cart item belongs to the user
    if (item.userId.toString() !== user._id.toString()) {
      throw new Error("You cannot update another user's cart item");
    }

    // Update item details
    item.quantity = cartItemData.quantity;
    item.price = item.quantity * item.product.price;
    item.discountedPrice = item.quantity * item.product.discountedPrice;

    // Save and return the updated item
    return await item.save();
  } catch (error) {
    console.error("Cannot update the cart item:", error.message);
    throw error;
  }
};

/**
 * Removes a cart item.
 * @param {string} userId - The ID of the user making the request.
 * @param {string} cartItemId - The ID of the cart item to remove.
 * @returns {Promise<object>} - The removed cart item document.
 * @throws {Error} - If the item does not belong to the user.
 */
const removeCartItem = async (userId, cartItemId) => {
  try {
    // Verify the user exists
    const user = await userService.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Find the cart item
    const item = await findCartItemById(cartItemId);

    // Ensure the cart item belongs to the user
    if (item.userId.toString() !== user._id.toString()) {
      throw new Error("You cannot remove another user's cart item");
    }

    // Delete and return the removed item
    return await CartItem.findByIdAndDelete(cartItemId);
  } catch (error) {
    console.error("Cannot remove the cart item:", error.message);
    throw error;
  }
};

module.exports = {
  updateCartItem,
  removeCartItem,
};
