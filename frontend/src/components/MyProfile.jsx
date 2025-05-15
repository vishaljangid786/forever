import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import Loading from "./Loading";
import Orders from "../pages/Orders";
import RefferedUsers from "../components/RefferedUsers";
import axios from "axios";

const MyProfile = () => {
  const navigate = useNavigate();
  const { token, setToken, userData, setUserData } =
    React.useContext(ShopContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [level, setLevel] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    setToken("");
  };

  const singleLevel = async () => {
    if (!userData?.level) return;
    try {
      const response = await axios.get(
        `${backendUrl}/api/level/singlelevel/${userData.level}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) setLevel(response.data.level);
      else toast.error("Failed to fetch level.");
    } catch (error) {
      console.error("Error fetching level:", error);
      if (error.response?.status === 401) logout();
    }
  };

  useEffect(() => {
    if (userData) {
      singleLevel();
      setEditData(userData);
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/user/updateprofile`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Profile updated successfully");
        setUserData(response.data.updatedUser);
        setIsEditing(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || "Something went wrong";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="max-w-5xl p-2 mx-auto sm:p-6">
      {userData ? (
        <>
          {/* Profile Header */}
          <div className="flex items-center justify-between py-6 border-b">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {userData.name}!
              </p>
            </div>
            <button
              onClick={logout}
              className="font-semibold text-red-500 hover:text-red-700">
              Logout
            </button>
          </div>
          <div className="px-4 py-2 mt-3 text-xl border rounded">
            <p className="font-bold text-gray-700">
              Your Uid: <span className="font-normal">{userData.uid}</span>
            </p>
          </div>

          {/* Current Level */}
          {level?.name && (
            <div className="my-4">
              <h2 className="text-xl font-semibold">Your Current Level:</h2>
              <p className="text-gray-700">{level.name}</p>
            </div>
          )}

          {/* Referral Code */}
          <div className="flex items-center justify-between p-4 my-4 bg-white rounded shadow">
            <div>
              <h3 className="text-lg font-semibold">Referral Code</h3>
              <p className="text-gray-700">{userData.referralCode}</p>
            </div>
            <button
              className="px-4 py-2 font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              onClick={() =>
                navigator.clipboard
                  .writeText(userData.referralCode)
                  .then(() => toast.success("Referral Code copied!"))
              }>
              Copy Code
            </button>
          </div>

          {/* Profile Info */}
          <div className="p-4 my-6 rounded shadow bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Profile Details</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm font-medium text-blue-600 hover:underline">
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                {["name", "phone", "location"].map((field) => (
                  <div key={field} className="flex items-center gap-2">
                    <label className="block font-medium text-gray-700 capitalize">
                      {field} {!isEditing && ":"}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name={field}
                        value={editData[field] || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 mt-1 border rounded"
                      />
                    ) : (
                      <p className="text-gray-800">{userData[field]}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Email (only visible when not editing) */}
              {!isEditing && (
                <div className="flex items-center gap-2">
                  <label className="block font-medium text-gray-700 capitalize">
                    Email :
                  </label>
                  <p className="text-gray-800">{userData.email}</p>
                </div>
              )}

              {/* Address */}
              <div>
                <label className="block font-medium text-gray-700">
                  Address
                </label>
                {["street", "city", "state", "country", "zipcode"].map(
                  (field) => (
                    <div key={field} className="mt-1">
                      {isEditing ? (
                        <input
                          type="text"
                          name={field}
                          placeholder={field}
                          value={editData?.address?.[field] || ""}
                          onChange={handleAddressChange}
                          className="w-full px-3 py-2 mt-1 border rounded"
                        />
                      ) : (
                        <p className="text-gray-800">
                          <span className="capitalize">{field}:</span>{" "}
                          {userData?.address?.[field] || "-"}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-6">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 font-medium text-white bg-green-600 rounded hover:bg-green-700">
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default MyProfile;
