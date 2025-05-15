import Bill from "../models/billModel.js";
import { v2 as cloudinary } from "cloudinary";

// Add Bill
export const addBill = async (req, res) => {
  try {
    const { uid, createdby,title } = req.body;

    // Check required fields
    if (!uid || !createdby ||!title || !req.file) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "image",
    });

    // Create new bill document
    const bill = new Bill({
      image: result.secure_url,
      uid,
      title,
      date: Date.now(),
      createdby,
    });

    await bill.save();

    res.status(201).json({
      success: true,
      message: "Bill uploaded successfully",
      bill,
    });
  } catch (error) {
    console.error("Error uploading bill:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find().sort({ date: -1 });
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bills" });
  }
};

export const getBillsByUser = async (req, res) => {
  const { uid } = req.params;

  try {
    const bills = await Bill.find({ uid }).sort({ date: -1 });
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user bills" });
  }
};

export const deleteBill = async (req, res) => {
  const { id } = req.params;

  try {
    const bill = await Bill.findByIdAndDelete(id);
    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }
    res.status(200).json({ message: "Bill deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete bill" });
  }
};