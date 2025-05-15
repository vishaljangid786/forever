import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";

const AllUsers = ({ userData }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("user");
  const navigate = useNavigate();
  const formatNumber = (value) => {
    const num = Number(value);
    if (isNaN(num)) return "0";
    return num % 1 === 0 ? num.toString() : num.toFixed(2);
  };
  
  useEffect(() => {
    if (!userData?.role === "seller") {
      toast.error("Unauthorized access. Only sellers can view this page.");
      navigate("/seller/add");
      return;
    }
  }, [userData, navigate]);


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${backendUrl}/api/user/fetchallusers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        let usersWithLevels = await Promise.all(
          response.data.users.map(async (user) => {
            if (!user.level) return { ...user, levelName: "No Level" };

            try {
              const levelResponse = await fetch(
                `${backendUrl}/api/level/singlelevel/${user.level}`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              if (!levelResponse.ok) throw new Error("Failed to fetch level");

              const data = await levelResponse.json();
              return { ...user, levelName: data.level.levelName };
            } catch (error) {
              console.error(
                `Error fetching level for user ${user.name}:`,
                error
              );
              return { ...user, levelName: "Unknown Level" };
            }
          })
        );

        setUsers(usersWithLevels);
      } catch (err) {
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${backendUrl}/api/user/updateRole`,
        { userId, role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, role: newRole } : user
          )
        );
      } else {
        console.error("Failed to update role:", response.data.message);
      }
    } catch (err) {
      console.error("Error updating role:", err.response?.data || err);
    }
  };

  const updateBlockedStatus = async (userId, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${backendUrl}/api/user/updateBlocked`,
        { userId, status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // ✅ Update the state immediately to reflect the change
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, blocked: status } : user
          )
        );

        toast.success(`User ${status ? "Blocked" : "Unblocked"} Successfully`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Something went wrong. Try again!");
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handlePriceChange = async (userId, price) => {
    let updatedPrice = price.trim() === "" ? 0 : Number(price); // Ensure empty input is set to 0

    // Update state immediately for instant feedback
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === userId ? { ...user, pricetopay: updatedPrice } : user
      )
    );

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${backendUrl}/api/user/updatePrice`,
        { userId, price: updatedPrice },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Price updated successfully");
      } else {
        toast.error("Failed to update price");
      }
    } catch (error) {
      console.error("Error updating user price:", error);
      toast.error("Something went wrong. Try again!");
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();

    // Convert `blocked` status to a readable string
    const blockedStatus = user.blocked ? "blocked" : "unblocked";

    // Match search criteria
    const matchesSearch =
      user.name?.toLowerCase().includes(query) ||
      user.uid?.toLowerCase().includes(query) ||
      user.levelName?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query) ||
      blockedStatus.includes(query)||
      user.option.toLowerCase().includes(query)

    // Special case: if search query is "blocked" or "unblocked", apply a strict filter
    if (query === "blocked") return user.blocked === true;
    if (query === "unblocked") return user.blocked === false;

    // Match user role filter
    const matchesRole =
    activeTab === "user" && (user.role === "user" || user.role === "admin")
    ||
      (activeTab === "seller" && user.role === "seller");

    return matchesSearch && matchesRole;
  });

  if (loading) return <Loading />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container p-0 mx-auto">
      <h2 className="mb-4 text-2xl font-bold text-center">All Members</h2>

      {/* 🔍 Search Input */}
      <div className="flex justify-center mb-4">
        <input
          type="text"
          placeholder="Search by Name or Email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg sm:w-96"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mt-3 mb-5 sm:mt-0">
        <button
          onClick={() => setActiveTab("user")}
          className={`px-4 py-2 rounded ${
            activeTab === "user" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}>
          Users
        </button>
        <button
          onClick={() => setActiveTab("seller")}
          className={`px-4 py-2 rounded ${
            activeTab === "seller" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}>
          Sellers
        </button>
      </div>

      {/* Desktop Table */}
      <div className="overflow-x-auto w-[100%] hidden sm:block">
        <table className="w-full text-sm border border-collapse sm:text-base">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 border">S.No.</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Uid</th>
              <th className="px-4 py-2 border">Role</th>
              {activeTab === "user" && (
                <>
                  <th className="px-4 py-2 border">Level</th>
                  <th className="px-4 py-2 border">PP</th>
                  <th className="px-4 py-2 border">Left</th>
                  <th className="px-4 py-2 border">Right</th>
                </>
              )}
              <th className="px-4 py-2 border">Blocked</th>
              {activeTab === "seller" && (
                <th className="px-4 py-2 border">Income</th>
              )}
              <th className="hidden px-4 py-2 border md:table-cell">
                Joining Date
              </th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={user._id} className="text-center">
                  <td className="px-4 py-2 border">{index + 1}</td>
                  <td className="px-4 py-2 border">
                    {user.name}{" "}
                    {user.role !== "seller" && (
                      <p className="text-sm text-gray-500">
                      {user.status ? "✅ Active" : "❌ Inactive"}
                    </p>)} 
                  </td>
                  <td className="px-4 py-2 border">{user.uid}</td>
                  <td className="px-4 py-2 border">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user._id, e.target.value)
                      }
                      className="px-2 py-1 bg-white border rounded">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="seller">Seller</option>
                    </select>
                  </td>
                  {activeTab === "user" && (
                    <>
                      <td className="px-4 py-2 border">{user.levelName}</td>
                      <td className="px-4 py-2 border">{formatNumber(user.cc)} PP</td>
                      <td className="px-4 py-2 border">{formatNumber(user.left)} PP</td>
                      <td className="px-4 py-2 border">{formatNumber(user.right)} PP</td>
                    </>
                  )}
                  <td className="hidden px-4 py-2 border md:table-cell">
                    <select
                      value={user?.blocked ? "true" : "false"}
                      onChange={(e) =>
                        updateBlockedStatus(user._id, e.target.value === "true")
                      }
                      className="px-2 py-1 border rounded">
                      <option value="true">Blocked</option>
                      <option value="false">Unblocked</option>
                    </select>
                  </td>
                  {activeTab === "seller" && (
                    <>
                      <td className="px-4 py-2 border">
                        <input
                          type="number"
                          className="w-[60px] px-2 border no-spinner"
                          value={user?.pricetopay ?? ""}
                          onChange={(e) =>
                            handlePriceChange(user._id, e.target.value)
                          }
                          placeholder="0"
                        />
                      </td>
                    </>
                  )}
                  <td className="hidden px-4 py-2 border md:table-cell">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => handleDeleteClick(user)}
                      className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-700">
                      Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="9"
                  className="px-4 py-2 mx-auto text-center border">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View (Cards) */}
      <div className="flex flex-wrap w-full sm:hidden">
        {filteredUsers.map((user, index) => (
          <div
            key={user._id}
            className="w-full p-3 mb-2 border rounded-md shadow-md">
            <p>
              <strong>S.No:</strong> {index + 1}
            </p>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p className="">
              <strong>State:</strong>
              <select
                value={user?.blocked ? "true" : "false"}
                onChange={(e) =>
                  updateBlockedStatus(user._id, e.target.value === "true")
                }
                className="">
                <option value="true">Blocked</option>
                <option value="false">Unblocked</option>
              </select>
            </p>
            <p className="">
              <strong>Pricetopay</strong>
              <input
                type="number"
                className="w-[100px] px-2 border"
                value={user?.pricetopay ?? ""}
                onChange={(e) => handlePriceChange(user._id, e.target.value)}
                placeholder="0"
              />
            </p>
            <p>
              <strong>Location:</strong> {user.address?.city},{" "}
              {user.address?.state}
            </p>
            <p>
              <strong>Joining Date:</strong>{" "}
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
            <p>
              <strong>Role:</strong>{" "}
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                className="px-2 py-1 bg-white border rounded">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </p>
            <button
              onClick={() => handleDeleteClick(user)}
              className="w-full px-6 py-2 mt-2 text-white bg-red-500 rounded hover:bg-red-700">
              Details
            </button>
          </div>
        ))}
      </div>

      {/* details Confirmation Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-600 bg-opacity-50">
          <div className="w-full max-w-xs p-4 bg-white rounded-lg shadow-lg sm:max-w-sm md:max-w-md">
            <h3 className="mb-4 text-xl font-semibold text-center">Details</h3>
            <p>
              <strong>Id:</strong> {selectedUser._id}
            </p>
            <p>
              <strong>Name:</strong> {selectedUser.name}
            </p>
            <p>
              <strong>Email:</strong> {selectedUser.email}
            </p>
            <p>
              <strong>Street:</strong> {selectedUser.address?.street},{" "}
            </p>
            <p>
              <strong>Uid:</strong> {selectedUser.uid},{" "}
            </p>
            <p>
              <strong>PP:</strong> {formatNumber(selectedUser.cc)},{" "}
            </p>
            <p>
              <strong>Left:</strong> {formatNumber(selectedUser.left)},{" "}
            </p>
            <p>
              <strong>Right:</strong> {formatNumber(selectedUser.right  )},{" "}
            </p>
            <p>
              <strong>Amount:</strong> {selectedUser.amount},{" "}
            </p>
            <p>
              <strong>Option:</strong> {selectedUser.option},{" "}
            </p>
            <p>
              <strong>Phone:</strong> {selectedUser.phone},{" "}
            </p>

            <p>
              <strong>Location:</strong> {selectedUser.address?.city},{" "}
              <strong>State:</strong>
              {selectedUser.address?.state}
            </p>
            <p>
              <strong>Zipcode:</strong> {selectedUser.address?.zipcode},{" "}
            </p>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 text-gray-700 bg-gray-300 rounded hover:bg-gray-500">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
