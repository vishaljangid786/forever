import requestModel from "../models/RequestedModel.js";
import userModel from "../models/userModel.js";

const createrequest = async (req, res) => {
  try {
    const {
      userId,
      mode,
      amount,
      upiId,
      account_number,
      ifsc_code,
      account_holder_name,
    } = req.body;

    // Validate required fields
    if (!userId || !amount || !mode) {
      return res
        .status(400)
        .json({ error: "User ID, amount, and mode are required" });
    }

    // Find the user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user has enough balance
    if (user.amount < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    let newRequestData = {
      userId,
      amount,
      mode,
      userDetails: {
        name: user.name, 
        email: user.email,
      },
    };

    if (mode === "upi") {
      if (!upiId)
        return res
          .status(400)
          .json({ error: "UPI ID is required for UPI mode" });
      newRequestData.upiId = upiId;
    } else if (mode === "account") {
      if (!account_number || !ifsc_code || !account_holder_name) {
        return res
          .status(400)
          .json({ error: "All bank details are required for account mode" });
      }
      newRequestData.account_number = account_number;
      newRequestData.ifsc_code = ifsc_code;
      newRequestData.account_holder_name = account_holder_name;
    } else {
      return res.status(400).json({ error: "Invalid mode" });
    }

    // Deduct the amount from user's wallet balance
    user.amount -= amount;
    await user.save();

    // Create the withdrawal request
    const newRequest = new requestModel(newRequestData);
    await newRequest.save();

    res.status(201).json({
      success: true,
      message: "Payment request created and balance deducted",
      data: newRequest,
      remainingBalance: user.amount, // Updated remaining balance
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { requestId, status } = req.body; // Get requestId from body

    if (!requestId) {
      return res.status(400).json({ error: "Request ID is required" });
    }

    if (!["pending", "completed", "failed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updatedRequest = await requestModel.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.json({
      success: true,
      message: "Status updated",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating request status:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getrequests = async (req, res) => {
  try {
    const requests = await requestModel
      .find()
      .populate("userId", "name email amount")

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const failrequest = async (req, res) => {
  try {
    const { requestId, amount, sellerId } = req.body;

    if (!requestId || !amount || !sellerId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Increase seller's balance
    await userModel.findByIdAndUpdate(sellerId, { $inc: { amount: amount } });

    // Update request status
    await requestModel.updateOne({ _id: requestId }, { status: "failed" });

    res.json({
      success: true,
      message: "Request marked as failed. Amount refunded.",
    });
  } catch (error) {
    console.error("Error handling failed request:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

const getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const transactions = await requestModel.find({ userId });

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const deleteRequest = async (req, res) => {
  try {
    const { requestId } = req.params; // Get requestId from URL parameters

    if (!requestId) {
      return res.status(400).json({ error: "Request ID is required" });
    }

    // Find the request
    const request = await requestModel.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // If the request was created and processed, return the user's balance to the account
    if (request.status === "pending" || request.status === "completed") {
      const user = await userModel.findById(request.userId);
      if (user) {
        user.amount += request.amount; // Refund the amount to the user
        await user.save();
      }
    }

    // Delete the request
    await requestModel.findByIdAndDelete(requestId);

    res.status(200).json({
      success: true,
      message: "Request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({ error: "Server error" });
  }
};




export { createrequest, getrequests, updateRequestStatus,failrequest,getUserTransactions,deleteRequest };