import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import Loading from "../components/Loading";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState({});
  const [productDetails, setProductDetails] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch All Orders
  const fetchAllOrders = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await axios.post(
        `${backendUrl}/api/order/list`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const fetchedOrders = response.data.orders.map((order) => ({
          ...order,
          address: order.address || {},
        }));

        setOrders(fetchedOrders.reverse());

        // Extract unique user IDs
        const userIds = [
          ...new Set(fetchedOrders.map((order) => order.userId)),
        ];
        fetchUserDetails(userIds);

        // Fetch product details
        fetchProductDetails(fetchedOrders);
      } else {
        toast.error(response.data.message || "Failed to fetch orders.");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred while fetching orders.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch User Details
  const fetchUserDetails = async (userIds) => {
    if (userIds.length === 0) return;
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/fetchMultipleUsers`,
        { userIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Store users in an object for quick access
        const userMap = {};
        response.data.users.forEach((user) => {
          userMap[user._id] = user;
        });
        setUserDetails(userMap);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  // Fetch Product Details
  const fetchProductDetails = async (orders) => {
    const productIds = [
      ...new Set(
        orders.flatMap((order) => order.items.map((item) => item.productId))
      ),
    ];

    if (productIds.length === 0) return;

    try {
      // Fetch all products at once if your backend supports it
      const response = await axios.post(
        `${backendUrl}/api/product/fetchMultipleProducts`, // Use a proper API for multiple products
        { productIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Store products in an object for easy access
        const productMap = {};
        response.data.products.forEach((product) => {
          productMap[product._id] = product;
        });

        setProductDetails(productMap);
      } else {
        console.error("Failed to fetch product details.");
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  const DeleteOrder = async (orderId) => {
    try {

      const response = await axios.post(
        `${backendUrl}/api/order/deleteadmin`,
        { orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // ✅ Remove the deleted order from the UI
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order._id !== orderId)
        );
        toast.success("Order deleted successfully!");
      } else {
        toast.error(response.data.message || "Failed to delete order.");
      }
    } catch (error) {
      toast.error("Error deleting order.");
    }
  };

  // Handle Status Change
  const statusHandler = async (event, orderId) => {
    try {

      const newStatus = event.target.value;
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        toast.success("Order status updated!");
      } else {
        toast.error("Failed to update order status.");
      }
    } catch (error) {
      toast.error("Error updating order status.");
    }
  };
  const filteredOrders = orders.filter((order) => {
    const user = userDetails[order.userId] || {};
    const name = user.name || "";
    const email = user.email || "";
    const orderId = order._id || "";

    const lowerSearch = searchTerm.toLowerCase();

    return (
      name.toLowerCase().includes(lowerSearch) ||
      email.toLowerCase().includes(lowerSearch) ||
      orderId.toLowerCase().includes(lowerSearch)
    );
  });

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  const statusOptions = [
    "Order Placed",
    "Packing",
    "Shipped",
    "Out for delivery",
    "Delivered",
  ];

  return (
    <div>
      <h3 className="mb-4 text-xl font-bold">Orders</h3>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by user name, email, or order ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded sm:w-96 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="text-gray-500">
          <Loading />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div>
          {filteredOrders.map((order, index) => {
            const currentStatusIndex = statusOptions.indexOf(order.status);
            const nextStatus = statusOptions[currentStatusIndex + 1];

            return (
              <div
                key={order._id}
                className="p-5 my-3 text-sm text-gray-700 border-2 border-gray-200 md:p-8 md:my-4"
              >
                {/* Order Header */}
                <div className="mb-3">
                  <div className="flex">
                    <p>{index + 1} .</p>
                    <h4 className="font-semibold">Order ID: {order._id}</h4>
                  </div>
                  <p>Date: {new Date(order.date).toLocaleString()}</p>
                </div>

                {/* User Details */}
                {userDetails[order.userId] ? (
                  <div className="p-3 bg-gray-100 rounded">
                    <h5 className="font-medium">👤 User Details:</h5>
                    <p>
                      <strong>Name:</strong> {userDetails[order.userId].name}
                    </p>
                    <p>
                      <strong>Email:</strong> {userDetails[order.userId].email}
                    </p>
                    <p>
                      <strong>Street:</strong>{" "}
                      {userDetails[order.userId].address.street}
                    </p>
                    <p>
                      <strong>City:</strong>{" "}
                      {userDetails[order.userId].address.city}
                    </p>
                    <p>
                      <strong>State:</strong>{" "}
                      {userDetails[order.userId].address.state}
                    </p>
                    <p>
                      <strong>Country:</strong>{" "}
                      {userDetails[order.userId].address.country}
                    </p>
                    <p>
                      <strong>Zipcode:</strong>{" "}
                      {userDetails[order.userId].address.zipcode}
                    </p>
                    {/* Order Status and Status Update Dropdown */}
                    <p className="mt-3">
                      <strong>Current Status:</strong>{" "}
                      <span className="text-blue-600">{order.status}</span>
                    </p>

                    <div className="mt-4">
                      <label
                        htmlFor={`status-${order._id}`}
                        className="mr-2 font-medium"
                      >
                        Change Status:
                      </label>
                      <select
                        id={`status-${order._id}`}
                        value={order.status}
                        onChange={(e) => statusHandler(e, order._id)}
                        className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Fetching user details...
                  </p>
                )}

                {/* Order Items */}
                <h5 className="mt-4 font-medium">🛒 Items:</h5>
                <ul>
                  {order.items.map((item, index) => {
                    const product = productDetails[item.productId];

                    return (
                      <li
                        key={`${item.productId}-${index}`}
                        className="p-3 mt-2 bg-gray-100 rounded"
                      >
                        {product ? (
                          <div className="flex items-center gap-3">
                            <div className="flex gap-2">
                              <p>
                                <strong>Name:</strong> {product.name}
                              </p>
                              <p>
                                <strong>Price:</strong> {currency}
                                {item.price}
                              </p>
                              <p>
                                <strong>Size:</strong> {item.size}
                              </p>
                              <p>
                                <strong>Color:</strong> {item.color}
                              </p>
                              <p>
                                <strong>Quantity:</strong> {item.quantity}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500">
                            Fetching product details...
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <button
                  onClick={() => DeleteOrder(order._id)}
                  className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                >
                  Delete Order
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
