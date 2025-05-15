import express from "express";
import upload from "../middleware/multer.js";
import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransactionStatus,
  deleteTransaction,
} from "../controllers/SellerTransationsController.js";

const SellerTransactionRouter = express.Router();

// CREATE: Add a new transaction (with image upload)
SellerTransactionRouter.post("/", upload.single("image"), createTransaction);

// READ: Get all transactions
SellerTransactionRouter.get("/", getAllTransactions);

// READ: Get single transaction by ID
SellerTransactionRouter.get("/:id", getTransactionById);

// UPDATE: Update transaction status
SellerTransactionRouter.put("/:id", updateTransactionStatus);

// DELETE: Delete a transaction
SellerTransactionRouter.delete("/:id", deleteTransaction);

export default SellerTransactionRouter;
