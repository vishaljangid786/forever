import mongoose from "mongoose";
import userModel from "./userModel.js";

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      size: String,
      color: String,
      price: Number,
      quantity: Number,
    },
  ],
  ccGiven: { type: Boolean, default: false },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, required: true, default: "Order Placed" },
  paymentMethod: { type: String, required: true },
  payment: { type: Boolean, required: true, default: false },
  date: { type: Number, required: true },
});
orderSchema.pre("findOneAndDelete", async function (next) {
  const order = await this.model.findOne(this.getFilter());

  if (order && order.userId) {
    await userModel.updateOne(
      { _id: order.userId },
      { $pull: { orders: order._id } }
    );
  }

  next();
});

const orderModel =
  mongoose.models.order || mongoose.model("Order", orderSchema);
export default orderModel;
