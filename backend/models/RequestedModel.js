import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 100,
    },
    mode: {
      type: String,
      enum: ["upi", "account"],
      required: true,
    },
    upiId: {
      type: String,
      trim: true,
      required: function () {
        return this.mode === "upi";
      },
    },
    account_number: {
      type: String,
      required: function () {
        return this.mode === "account";
      },
    },
    ifsc_code: {
      type: String,
      required: function () {
        return this.mode === "account";
      },
    },
    account_holder_name: {
      type: String,
      required: function () {
        return this.mode === "account";
      },
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const requestModel = mongoose.model("Request", requestSchema);
export default requestModel;
