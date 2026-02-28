import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";

const addToCart = async (req, res) => {
  try {
    const { productId, quantity, color, size, price } = req.body;
    const userId = req.user.id || req.user.userId;

    // Validate required fields
    if (!userId || !productId || !quantity || !color || !size || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find the user's cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart if not found
      cart = new Cart({
        userId,
        items: [{ productId, quantity, color, size, price: Number(price) }],
      });
    } else {
      // Convert productId to string for comparison
      let existingItemIndex = cart.items.findIndex(
        (item) =>
          item.productId.toString() === productId.toString() &&
          item.color === color &&
          item.size === size
      );

      if (existingItemIndex !== -1) {
        // If item exists, update the quantity
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // If item doesn't exist, add as new entry
        cart.items.push({ productId, quantity, color, size, price: Number(price) });
      }
    }

    // Explicitly mark array as modified
    cart.markModified("items");
    await cart.save();

    res.status(201).json({ success: "Item added to cart", cart });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// get user cart data
const getCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "name price image category", // Select only required fields
    });

    res.json({
      success: true,
      cart: cart || { items: [] }, // Return an empty cart if no cart exists
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cart",
    });
  }
};

// Function to update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId || req.user.id;


    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const cartItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (!cartItem) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    cartItem.quantity = quantity;
    await cart.save();
    await cart.populate("items.productId");

    res.json({ success: true, cart, message: "Cart Updated" });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ success: false, message: "Error updating cart" });
  }
};
// Function to remove from cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.userId || req.user.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }


    // Remove item from cart
    cart.items = cart.items.filter(
      (item) => item._id.toString() !== productId && item.productId.toString() !== productId
    );

    await cart.save();
    await cart.populate("items.productId");

    res.json({
      success: true,
      message: "Item removed successfully",
      cart,
    });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({
      success: false,
      message: "Error removing item from cart",
    });
  }
};

export { addToCart, updateCartItem, getCart, removeFromCart };
