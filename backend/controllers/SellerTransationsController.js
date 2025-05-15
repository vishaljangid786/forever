import SellerTransactionModel from "../models/SellerTransations.js";
import {v2 as cloudinary} from 'cloudinary' // Adjust path as per your setup

export const createTransaction = async (req, res) => {
  try {
    const { uid, amount, shopName, transactionId } = req.body;
    

    // Validate required fields
    if (!uid || !amount || !transactionId || !req.file || !shopName) {
      return res.status(400).json({
        success: false,
        message: "All fields (uid, amount, transactionId, image) are required",
      });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "image",
    });

    // Create and save the transaction
    const newTransaction = new SellerTransactionModel({
      uid,
      amount,
      transactionId,
      shopName,
      image: result.secure_url,
    });

    const savedTransaction = await newTransaction.save();

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: savedTransaction,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get all transactions
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await SellerTransactionModel.find().sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a transaction by ID
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await SellerTransactionModel.findById(id);
    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }
    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update transaction status
export const updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedTransaction = await SellerTransactionModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedTransaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    res.status(200).json({ success: true, data: updatedTransaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a transaction
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTransaction = await SellerTransactionModel.findByIdAndDelete(
      id
    );

    if (!deletedTransaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
