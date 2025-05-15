import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import razorpay from "razorpay";
import jwt from "jsonwebtoken";
import productModel from "../models/productModel.js";
import Cart from "../models/cartModel.js";
import mongoose from "mongoose";

// global variables
const currency = "inr";
const deliveryCharge = 10;

// gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const placeOrder = async (req, res) => {
  try {
    const { userId, userDetails, address, items, amount } = req.body;

    if (!userId || !items || items.length === 0 || !address) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order data" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const productIds = items.map((item) => item.productId);
    const products = await productModel.find({ _id: { $in: productIds } });

    if (!products.length) {
      return res
        .status(404)
        .json({ success: false, message: "Products not found" });
    }

    // Enrich items with full product details
    const enrichedItems = items.map((item) => {
      const product = products.find((p) => p._id.toString() === item.productId);
      return {
        ...item,
        productDetails: product,
      };
    });

    // Group by seller and compute cc * 160 for each
    const sellerCcMap = {};

    enrichedItems.forEach((item) => {
      const sellerId = item.productDetails.createdBy;
      const productCC = item.productDetails.cc || 0;
      const total = productCC * 160;

      if (!sellerCcMap[sellerId]) {
        sellerCcMap[sellerId] = 0;
      }
      sellerCcMap[sellerId] += total;
    });

    // Create new order
    const newOrder = new orderModel({
      userId,
      userDetails,
      address,
      items: enrichedItems,
      amount,
      paymentMethod: "cod",
      paymentStatus: "pending",
      orderStatus: "processing",
      date: new Date(),
    });

    await newOrder.save();

    // Add order to buyer's order list
    if (!user.orders) user.orders = [];
    user.orders.push(newOrder._id);
    await user.save();

    // Update each seller's selled and priceToPay

    for (const [sellerId, totalPrice] of Object.entries(sellerCcMap)) {
      const seller = await userModel.findById(sellerId);
      if (seller) {
        const prevPriceToPay = seller.pricetopay || 0;

        if (!seller.selled) seller.selled = [];
        if (!seller.priceToPay) seller.priceToPay = 0;

        seller.selled.push(newOrder._id);
        // seller.pricetopay += totalPrice;
        await seller.save();
      }
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error placing COD order:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Placing orders using Stripe Method
const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    const { origin } = req.headers;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const line_items = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: currency,
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: "payment",
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Verify Stripe
const verifyStripe = async (req, res) => {
  const { orderId, success, userId } = req.body;

  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.json({ success: true });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Placing orders using Razorpay Method
const placeOrderRazorpay = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Razorpay",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const options = {
      amount: amount * 100,
      currency: currency.toUpperCase(),
      receipt: newOrder._id.toString(),
    };

    await razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        return res.json({ success: false, message: error });
      }
      res.json({ success: true, order });
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const verifyRazorpay = async (req, res) => {
  try {
    const { userId, razorpay_order_id } = req.body;

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
    if (orderInfo.status === "paid") {
      await orderModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.json({ success: true, message: "Payment Successful" });
    } else {
      res.json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// All Orders data for Admin Panel
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// User Order Data For Forntend
const userOrders = async (req, res) => {
  try {
    // Get token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId;

    // Find orders associated with the user
    const orders = await orderModel.find({ userId }).sort({ date: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getSingleOrder = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required" });
    }

    let order = await orderModel.findById(id).populate("userId").populate({
      path: "items.productId",
      model: "Product",
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found", id: undefined });
    }

    // Convert Mongoose document to a plain object
    order = order.toObject();

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const addCCToReferrers = async (referrerId, totalCC, childId) => {
  while (referrerId) {
    const referrer = await userModel.findById(referrerId);
    if (!referrer) {
      console.log("❌ Referrer not found:", referrerId);
      break;
    }

    const child = await userModel.findById(childId);
    if (!child) {
      console.log("❌ Child not found:", childId);
      break;
    }

    if (child.option === "left") {
      referrer.left = (referrer.left || 0) + totalCC;
    } else if (child.option === "right") {
      referrer.right = (referrer.right || 0) + totalCC;
    } else {
      console.log(`⚠️ Child option not left/right for ${child.name}`);
    }

    console.log(`🔄 Updating CC for referrer: ${referrer.name}`);

    await referrer.save();

    // prepare for next loop
    childId = referrerId;
    referrerId = referrer.referredBy;
  }
};


const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      console.log("❌ Missing orderId or status");
      return res.status(400).json({
        success: false,
        message: "Missing orderId or status",
      });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      console.log("❌ Order not found with ID:", orderId);
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // If already delivered and ccGiven, return early
    if (order.status === "delivered" && order.ccGiven) {
      return res.status(400).json({
        success: false,
        message: "CC already added for this delivered order",
      });
    }

    order.status = status;

    // When delivering, add CC
    if (status.toLowerCase() === "delivered" && !order.ccGiven) {
      console.log("🚚 Order is being marked as delivered. Processing CC...");

      const user = await userModel.findById(order.userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const productIds = order.items.map((item) => item.productId);
      const products = await productModel.find({ _id: { $in: productIds } });

      let totalCC = 0;
      const sellerCcMap = {}; // To track seller earnings

      order.items.forEach((item) => {
        const product = products.find(
          (p) => p._id.toString() === item.productId.toString()
        );
        if (product) {
          if (product.cc) {
            totalCC += product.cc * item.quantity;
          }
          const sellerId = product.createdBy;
          const productCC = product.cc || 0;
          const total = productCC * 160;

          if (!sellerCcMap[sellerId]) {
            sellerCcMap[sellerId] = 0;
          }
          sellerCcMap[sellerId] += total;
        }
      });

      user.cc = (user.cc || 0) + totalCC;
      await user.save();

      if (user.referredBy) {
        await addCCToReferrers(user.referredBy, totalCC, user._id);
      }

      for (const [sellerId, totalPrice] of Object.entries(sellerCcMap)) {
        const seller = await userModel.findById(sellerId);
        if (seller) {
          if (!seller.selled) seller.selled = [];
          if (!seller.pricetopay) seller.pricetopay = 0;

          seller.selled.push(order._id);
          seller.pricetopay += totalPrice;
          await seller.save();
        } else {
          console.log(`❌ Seller not found for ID: ${sellerId}`);
        }
      }

      order.ccGiven = true;
      console.log("🏁 Marked order as CC given");
    }

    await order.save();
    console.log("✅ Order saved successfully");

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete order from admin panel
const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required" });
    }

    // Check if order exists and is eligible for deletion (not delivered or out for delivery)
    const deletedOrder = await orderModel.findOneAndDelete({
      _id: orderId,
      status: { $nin: ["Delivered", "Out for delivery"] },
    });


    // If no order is deleted, return an error
    if (!deletedOrder) {
      return res
        .status(403)
        .json({ success: false, message: "Cannot delete this order" });
    }

    // Return a success response
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const deleteOrderAdmin = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required" });
    }

    // Check if order exists and is eligible for deletion (not delivered or out for delivery)
    const deletedOrder = await orderModel.findOneAndDelete({
      _id: orderId,
    });
    

    // If no order is deleted, return an error
    if (!deletedOrder) {
      return res
        .status(403)
        .json({ success: false, message: "Cannot delete this order" });
    }

    // Return a success response
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export {
  verifyRazorpay,
  verifyStripe,
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  allOrders,
  userOrders,
  getSingleOrder,
  updateStatus,
  deleteOrder,
  deleteOrderAdmin,
};
