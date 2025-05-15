import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { backendUrl } from "../App";

const Bill = ({ userData }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    uid: "",
    title: "",
    createdby: "",
    image: null,
  });
  const [bills, setBills] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      createdby: userData?.shopName || "",
      uid: userData?.uid || "",
    }));
  }, [userData]);


  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/bill/all`);
        setBills(res.data || []);
      } catch (err) {
        console.error("Failed to fetch bills:", err);
      }
    };
    fetchBills();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      if (file) {
        setFormData({ ...formData, image: file });

        const fileReader = new FileReader();
        fileReader.onloadend = () => {
          setImagePreview(fileReader.result);
        };
        fileReader.readAsDataURL(file);
      } else {
        setFormData({ ...formData, image: null });
        setImagePreview(null);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { uid, title, createdby, image } = formData;

    if (!uid || !title || !createdby || !image) {
      return alert("All fields are required!");
    }

    try {
      setIsSubmitting(true);
      const data = new FormData();
      data.append("uid", uid);
      data.append("title", title);
      data.append("createdby", createdby);
      data.append("image", image);

      const res = await axios.post(`${backendUrl}/api/bill/add`, data);
      alert("Bill created successfully!");
      setIsSubmitting(false);
      setBills((prev) => [...prev, res.data.bill]);
      setShowForm(false);
      setFormData({
        uid: "",
        title: "",
        createdby: userData.shopName || "",
        image: null,
      });
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return;
    try {
      await axios.delete(`${backendUrl}/api/bill/delete/${id}`);
      setBills((prev) => prev.filter((bill) => bill._id !== id));
    } catch (err) {
      console.error("Failed to delete bill:", err);
    }
  };

  const filteredBills = bills.filter((bill) =>
    userData?.role === "admin"
      ? bill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.uid.toLowerCase().includes(searchTerm.toLowerCase())
      : bill.uid === userData?.uid &&
        (bill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bill.uid.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const downloadImage = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed", error);
      alert("Failed to download the bill image.");
    }
  };

  return (
    <div className="p-6 mx-auto bg-white rounded shadow-lg max-w-7xl">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 mb-4 text-white bg-green-600 rounded hover:bg-green-700">
          Create Bill
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-800">New Bill</h2>

          <input
            type="text"
            name="uid"
            placeholder="User ID"
            value={formData.uid}
            onChange={handleChange}
            className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isSubmitting || !!userData?.uid}
          />

          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          />

          <input
            type="text"
            name="createdby"
            placeholder="Created By"
            value={formData.createdby}
            onChange={handleChange}
            readOnly={!!userData?.shopName}
            className={`p-3 border rounded-md ${
              userData?.shopName ? "bg-gray-100" : ""
            }`}
          />

          <input
            type="file"
            name="image"
            ref={fileInputRef}
            onChange={handleChange}
            accept="image/*"
            className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          />

          {imagePreview && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Image Preview
              </h3>
              <img
                src={imagePreview}
                alt="Preview"
                className="object-cover w-32 h-32 mt-2 rounded-lg shadow-md"
              />
            </div>
          )}

          <div className="flex justify-between gap-4">
            <button
              type="submit"
              className={`px-6 py-2 text-white ${
                isSubmitting ? "bg-blue-400" : "bg-blue-600"
              } rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-white animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 1116 0A8 8 0 014 12z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Bill"
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({
                  uid: "",
                  title: "",
                  createdby: userData.shopName || "",
                  image: null,
                });
                setImagePreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="px-6 py-2 text-white bg-gray-500 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isSubmitting}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Title or UID"
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 font-semibold border">S.No.</th>
              <th className="p-2 font-semibold border">Title</th>
              <th className="p-2 font-semibold border">UID</th>
              <th className="p-2 font-semibold border">Image</th>
              <th className="p-2 font-semibold border">Download</th>
              {userData?.role === "admin" && (
                <th className="p-2 font-semibold border">Created By</th>
              )}
              {userData?.role === "admin" && (
                <th className="p-2 font-semibold border">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredBills.length === 0 ? (
              <tr>
                <td
                  className="p-2 text-center border"
                  colSpan={userData?.role === "admin" ? 7 : 5}>
                  {searchTerm
                    ? "No matching bills found."
                    : userData?.role === "admin"
                    ? "No bills available."
                    : "You haven't created any bills yet."}
                </td>
              </tr>
            ) : (
              filteredBills.map((bill, index) => (
                <tr key={bill._id} className="bg-white border-b">
                  <td className="p-2 border">{index + 1}</td>
                  <td className="p-2 border">{bill.title}</td>
                  <td className="p-2 border">{bill.uid}</td>
                  <td className="p-2 border">
                    <img
                      src={bill.image}
                      alt="Bill"
                      className="object-cover w-20 h-16 rounded"
                    />
                  </td>
                  <td className="p-2 border">
                    <button
                      onClick={() =>
                        downloadImage(
                          bill.image,
                          `${bill.title}-${bill.uid}.jpg`
                        )
                      }
                      className="px-3 py-1 text-white bg-indigo-600 rounded hover:bg-indigo-700">
                      Download
                    </button>
                  </td>
                  {userData?.role === "admin" && (
                    <td className="p-2 border">{bill.createdby}</td>
                  )}
                  {userData?.role === "admin" && (
                    <td className="p-2 border">
                      <button
                        onClick={() => handleDelete(bill._id)}
                        className="px-3 py-1 text-white bg-red-600 rounded hover:bg-red-700">
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Bill;
