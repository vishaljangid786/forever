import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";

const BannerImages = ({ token, userData }) => {
  const [images, setImages] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch Banners
  useEffect(() => {
    if (!userData?._id) return;

    const fetchBanners = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/banner`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setImages(response.data.results.data);
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };

    fetchBanners();
  }, [userData?._id, token]);

  // Handle Delete Confirmation
  const handleDeleteClick = (banner) => {
    setSelectedBanner(banner);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${backendUrl}/api/banner/${selectedBanner._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setImages(images.filter((img) => img._id !== selectedBanner._id));
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Error deleting banner:", err);
    }
  };

  // Handle File Selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Handle File Upload
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", selectedFile); // "image" should match multer.single("image")

    try {
      const response = await axios.post(`${backendUrl}/api/banner`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Image uploaded successfully!");
      setImages([...images, response.data.banner]); // Update state
      setShowUploadModal(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };
  


  return (
    <div className="container p-0 mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">All Banners</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-700">
          Add Banner
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden w-full overflow-x-auto sm:block">
        <table className="w-full text-sm border border-collapse sm:text-base">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 border">S.No.</th>
              <th className="px-4 py-2 border">Image</th>
              <th className="px-4 py-2 border">Delete</th>
            </tr>
          </thead>
          <tbody>
            {images.map((img, index) => (
              <tr key={img._id} className="text-center">
                <td className="px-4 py-2 border">{index + 1}</td>
                <td className="px-4 py-2 border">
                  <img
                    src={`${backendUrl}${img.image}`}
                    alt="Banner"
                    className="mx-auto w-[100px] h-10 object-contain"
                  />
                </td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleDeleteClick(img)}
                    className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-700">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="flex flex-wrap w-full sm:hidden">
        {images.map((img, index) => (
          <div
            key={img._id}
            className="w-full p-3 mb-2 border rounded-md shadow-md">
            <p>
              <strong>S.No:</strong> {index + 1}
            </p>
            <img src={img.image} alt="Banner" className="w-full h-auto" />
            <button
              onClick={() => handleDeleteClick(img)}
              className="w-full px-6 py-2 mt-2 text-white bg-red-500 rounded hover:bg-red-700">
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-600 bg-opacity-50">
          <div className="w-full max-w-xs p-4 bg-white rounded-lg shadow-lg sm:max-w-sm md:max-w-md">
            <h3 className="mb-4 text-xl font-semibold text-center">
              Confirm Delete
            </h3>
            <p>Are you sure you want to delete this image?</p>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
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

      {/* Upload Image Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-600 bg-opacity-50">
          <div className="w-full max-w-sm p-4 bg-white rounded-lg shadow-lg">
            <h3 className="mb-4 text-xl font-semibold text-center">
              Upload Banner Image
            </h3>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 mb-4 border rounded"
            />
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-6 py-2 text-gray-700 bg-gray-300 rounded hover:bg-gray-500">
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="px-6 py-2 text-white bg-green-500 rounded hover:bg-green-700"
                disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerImages;
