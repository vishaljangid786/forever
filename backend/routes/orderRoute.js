import express from "express";
import {
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
  verifyStripe,
  verifyRazorpay,
  deleteOrder,
  getSingleOrder,
  deleteOrderAdmin,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

const orderRouter = express.Router();

// Admin Features
orderRouter.post("/list", allOrders);
orderRouter.post("/status", adminAuth, updateStatus);
orderRouter.post("/delete", deleteOrder);
orderRouter.post("/deleteadmin", adminAuth, deleteOrderAdmin);

// Payment Features
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/stripe", authUser, placeOrderStripe);
orderRouter.post("/razorpay", authUser, placeOrderRazorpay);

// User Feature
orderRouter.get("/userorders", authUser, userOrders);
orderRouter.post("/updatestatus", authUser, updateStatus);
orderRouter.post("/singleorder", authUser, getSingleOrder);

// verify payment
orderRouter.post("/verifyStripe", authUser, verifyStripe);
orderRouter.post("/verifyRazorpay", authUser, verifyRazorpay);

export default orderRouter;
