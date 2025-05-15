import DeleteModel from "../models/deletemodel.js"; // Ensure correct path

const createdeleteRequest = async (req, res) => {
  try {
    const { uid, password,email } = req.body;

    if (!uid || !password || !email) {
      return res.status(400).json({
        success: false,
        message: "User ID and password are required",
      });
    }

    const existingUser = await DeleteModel.findOne({ uid });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const newDelete = new DeleteModel({ uid, password,email });
    await newDelete.save();

    res.status(201).json({
      success: true,
      message: "Request created successfully",
    });
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({
      success: false,
      message: "Error creating request",
    });
  }
};

const getdeleterequests = async (req, res) => {
  try {
    const requests = await DeleteModel.find();
    
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching requests",
    });
  }
};

const deletedeleterequests = async (req, res) => {
  try {
    const { uid } = req.params;
    

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const deletedRequest = await DeleteModel.findOneAndDelete({ uid });

    if (!deletedRequest) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    res.json({
      success: true,
      message: "Request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting request",
    });
  }
};

export {
  createdeleteRequest,
  getdeleterequests,
  deletedeleterequests,
};
