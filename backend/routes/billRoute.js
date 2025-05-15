import express from "express";
import upload from "../middleware/multer.js";

const billRouter = express.Router();
import {
  addBill,
  getAllBills,
  getBillsByUser,
  deleteBill
} from "../controllers/billController.js";

// Add Bill
billRouter.post("/add", upload.single("image"), addBill);
// Get All Bills
billRouter.get("/all", getAllBills);
// Get Bills by User
billRouter.get("/user/:uid", getBillsByUser);
// Delete Bill
billRouter.delete("/delete/:id", deleteBill);

export default billRouter;