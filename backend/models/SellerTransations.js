import mongoose from "mongoose";
const SellerTransactionsSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    shopName: {
      type: String,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);


const SellerTransactionModel = mongoose.model("SellerTransaction", SellerTransactionsSchema);
export default SellerTransactionModel;