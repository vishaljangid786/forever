import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const LevelIncome = ({ token, userData }) => {
  const [level, setLevel] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [uploadShowModel, setUploadShowModel] = useState(false);
  // State to store form data
  const [formData, setFormData] = useState({
    levelName: "",
    left: "",
    right: "",
    levelType: "",
    price: "",
  });

  useEffect(() => {
    if (!userData?._id) return;

    const fetchLevel = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/level/getAllLevel`,
          {
            headers: { Authorization: `Bearer ${token}` }, // ✅ Correct header usage
          }
        );

        setLevel(response.data.level);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchLevel();
  }, [userData?._id, backendUrl, token, uploadShowModel]);

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `${backendUrl}/api/level/delete/${selectedUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          //   data: { id: selectedUser._id }, // ✅ Sending ID in body
        }
      );

      setLevel(level.filter((level) => level._id !== selectedUser._id));
      setShowModal(false);
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Convert only text inputs to uppercase
    const updatedValue = isNaN(value) ? value.toUpperCase() : value;

    setFormData({ ...formData, [name]: updatedValue });
  };

  // Handle form submission (API Call)
  const handleUpload = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/level/addNewLevel`,
        {
          levelName: formData.levelName,
          left: formData.left,
          right: formData.right,
          levelType: formData.levelType || " ",
          price: formData.price,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Optional if using auth
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("level added successfully")
      setFormData({
        levelName: "",
        left: "",
        right: "",
        levelType: " ",
        price: "",
      });
      setUploadShowModel(false);
    } catch (error) {
      console.error(
        "Error adding level:",
        error.response?.data || error.message
      );
      alert("Failed to add level");
    }
  };

  return (
    <div className="container p-0 mx-auto">
      <div className="flex justify-around">
        <h2 className="mb-4 text-2xl font-bold text-center">All Level</h2>
        <h2 className="mb-4 text-2xl font-bold text-center">
          <button
            onClick={() => setUploadShowModel(true)}
            className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-700">
            Add New Level
          </button>
        </h2>
      </div>

      {/* Desktop Table */}
      <div className="overflow-x-auto w-[100%] hidden sm:block">
        <table className="w-full text-sm border border-collapse sm:text-base">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 border">S.No.</th>
              <th className="px-4 py-2 border">Level</th>
              <th className="px-4 py-2 border">Left</th>
              <th className="px-4 py-2 border">Right</th>
              <th className="px-4 py-2 border">Reward</th>
              <th className="px-4 py-2 border">Level Income</th>
              <th className="px-4 py-2 border">Delete</th>
            </tr>
          </thead>
          <tbody>
            {level.map((level, index) => (
              <tr key={level._id} className="text-center">
                <td className="px-4 py-2 border">{index + 1}</td>
                <td className="px-4 py-2 border">{level.levelName}</td>
                <td className="px-4 py-2 border">{level.left} PP</td>
                <td className="px-4 py-2 border">{level.right} PP</td>
                <td className="px-4 py-2 border">{level.levelType}</td>
                <td className="px-4 py-2 border">{level.price}</td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleDeleteClick(level)}
                    className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-700">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-600 bg-opacity-50">
          <div className="w-full max-w-xs p-4 bg-white rounded-lg shadow-lg sm:max-w-sm md:max-w-md">
            <h3 className="mb-4 text-xl font-semibold text-center">
              Confirm Delete
            </h3>
            <p>Are you sure you want to delete this Level</p>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 text-gray-700 bg-gray-300 rounded hover:bg-gray-500">
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-6 py-2 text-white bg-red-500 rounded hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Uploading Level */}
      {uploadShowModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-600 bg-opacity-50">
          <div className="w-full max-w-sm p-4 bg-white rounded-lg shadow-lg">
            <h3 className="mb-4 text-xl font-semibold text-center">
              Add Level Details
            </h3>

            {/* Input Fields */}
            <input
              type="text"
              name="levelName"
              placeholder="Level Name"
              value={formData.levelName}
              onChange={handleInputChange}
              className="w-full p-2 mb-2 border rounded"
            />

            <input
              type="number"
              name="left"
              placeholder="Left"
              value={formData.left}
              onChange={handleInputChange}
              className="w-full p-2 mb-2 border rounded"
            />

            <input
              type="number"
              name="right"
              placeholder="Right"
              value={formData.right}
              onChange={handleInputChange}
              className="w-full p-2 mb-2 border rounded"
            />

            <input
              type="text"
              name="levelType"
              placeholder="Level Type"
              value={formData.levelType} // Shows value when typed
              onChange={handleInputChange}
              className="w-full p-2 mb-2 border rounded"
            />

            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full p-2 mb-4 border rounded"
            />

            {/* Buttons */}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setUploadShowModel(false)}
                className="px-6 py-2 text-gray-700 bg-gray-300 rounded hover:bg-gray-500">
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-6 py-2 text-white bg-green-500 rounded hover:bg-green-700">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelIncome;
