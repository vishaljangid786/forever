import IncomeLevel from "../models/incomeLevel.js";
import userModel from "../models/userModel.js";

const addNewLevel = async (req, res) => {
  try {
    const { levelName, left, right, levelType, price } = req.body;
    if (!levelName || !left || !right || !price || !levelType) {
      return res.status(400).json({
        error: "required MissingField",
        message: {
          levelName: !levelName ? "levelName is required" : undefined,
          left: !left ? "left is required" : undefined,
          right: !right ? "right is required" : undefined,
          price: !price ? "price is required" : undefined,
          levelType: !levelType ? "levelType is required" : undefined,
        },
      });
    }
    const existLevel = await IncomeLevel.findOne({ levelName });
    if (existLevel) {
      return res
        .status(409)
        .json({ message: `This ${levelName} already exist` });
    }
    const newLevel = new IncomeLevel({
      levelName,
      left,
      levelType,
      right,
      price,
    });
    await newLevel.save();

    res.status(201).json({ message: "new Level create successful" });
  } catch (error) {
    console.error("addNewLevel Error", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllLevel = async (req, res) => {
  try {
    const existLevel = await IncomeLevel.find({});
    if (!existLevel || existLevel.length === 0) {
      return res.status(400).json({ message: "Not Exist Any Level in DB" });
    }
    res.status(200).json({ message: "get all Level", level: existLevel });
  } catch (error) {
    console.error("getAllLevel Error", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteLevel = async (req, res) => {
  try {
    const { id } = req.params; // Get ID from request params

    // Check if the level exists
    const level = await IncomeLevel.findById(id);
    if (!level) {
      return res.status(404).json({ message: "Level not found" });
    }

    // Delete the level
    await IncomeLevel.findByIdAndDelete(id);

    res.status(200).json({ message: "Level deleted successfully" });
  } catch (error) {
    console.error("deleteLevel Error", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getSingleLevel = async (req,res) => {
  try {
    const { id } = req.params; 
    const level = await IncomeLevel
     .findById(id)

    if (!level) {
      return res.status(404).json({ message: "Level not found" });
    }
    res.status(200).json({ success: true, level: level });
  }
  catch (error) {
    console.error("getSingleLevel Error", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  } 
}


export { addNewLevel, getAllLevel, deleteLevel ,getSingleLevel};
