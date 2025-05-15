import React, { useState, useEffect } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import axios from "axios";

const SellerOrder = ({ userData, token }) => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!userData?.selled || userData.selled.length === 0) {
      setOrders([]);
      return;
    }

    const fetchOrders = async () => {
      try {
        const orderRequests = userData.selled.map((orderId) =>
          axios.post(
            `${backendUrl}/api/order/singleorder`,
            { id: orderId },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        );

        const responses = await Promise.allSettled(orderRequests);

        const fetchedOrders = responses
          .map((res, index) => {
            if (res.status === "fulfilled" && res.value.data.order) {
              return res.value.data.order;
            } else {
              console.warn(`Missing order: ${userData.selled[index]}`);
              return null;
            }
          })
          .filter(Boolean);

        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to fetch orders!");
      }
    };

    fetchOrders();
  }, [userData, token]);

  const statusOptions = [
    "Order Placed",
    "Packing",
    "Shipped",
    "Out for delivery",
    "Delivered",
  ];

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;

    try {
      await axios.post(
        `${backendUrl}/api/order/updatestatus`,
        { orderId, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast.success("Order status updated!");
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Could not update order status.");
    }
  };

  const parseColor = (colorStr) => {
    try {
      const parsed = JSON.parse(colorStr);
      return Array.isArray(parsed) ? parsed.join(", ") : parsed;
    } catch {
      return colorStr; // fallback to string if not JSON
    }
  };
  
  // Filter orders based on search query
  const filteredOrders = orders.filter((order) => {
    const orderDetails = `${order._id} ${order.status} ${
      order.userId?.name
    } ${order.items.map((item) => item?.productId?.name).join(" ")}`;
    return orderDetails.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="max-w-6xl p-6 mx-auto">
      <h3 className="mb-6 text-2xl font-semibold text-gray-800">
        Seller Orders
      </h3>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          className="w-full p-2 px-4 border rounded-md sm:w-1/2 "
          placeholder="Search by Order ID, Product Name, or Buyer Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query
        />
      </div>

      {!filteredOrders || filteredOrders.length === 0 ? (
        <p className="text-center text-gray-500">No orders yet.</p>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const currentStatusIndex = statusOptions.indexOf(order.status);
            const nextStatus = statusOptions[currentStatusIndex + 1];

            return (
              <div
                key={order._id}
                className="p-6 bg-white border border-gray-200 rounded-lg shadow-md">
                {/* Icon */}
                <div className="flex items-center space-x-4">
                  <img
                    className="w-12 h-12"
                    src={assets.parcel_icon}
                    alt="Parcel"
                  />
                  <h4 className="text-xl font-semibold text-gray-800">
                    Order #{order._id}
                  </h4>
                </div>

                {/* Product Details */}
                <div className="mt-4">
                  <div className="flex flex-wrap gap-3">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 mb-4 border rounded w-[300px]">
                        <h5 className="text-lg font-semibold">
                          {index + 1}. Product: {item?.productId?.name || "N/A"}
                        </h5>
                        <p className="font-medium text-gray-700">
                          Price: ₹{item?.price || "N/A"}
                        </p>
                        <p className="text-sm">Size: {item.size || "N/A"}</p>
                        <p className="text-sm">
                          Color: {parseColor(item.color)}
                        </p>
                        <p className="text-sm">Quantity: {item.quantity}</p>
                        <p className="font-semibold text-gray-800">
                          Total: ₹{item.price * item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="text-sm text-gray-600">
                    <p className="font-medium">
                      Buyer: {order.userId?.name || "Unknown"}
                    </p>
                    <p>{order.userId?.address?.street || "Street N/A"}</p>
                    <p>
                      {order.userId?.address?.city || "City N/A"},{" "}
                      {order.userId?.address?.state || "State N/A"}
                    </p>
                    <p>
                      {order.userId?.address?.country || "Country N/A"},{" "}
                      {order.userId?.address?.zipcode || "ZIP N/A"}
                    </p>
                    <p>{order.userId?.phone || "Phone N/A"}</p>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <p className="text-sm">Items: {order.items.length}</p>
                  <p className="text-sm">Method: {order.paymentMethod}</p>
                  <p className="text-sm">
                    Payment: {order.status }
                  </p>
                  <p className="text-sm">
                    Date: {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>

                {/* Amount */}
                <div className="mt-4 text-2xl font-bold text-gray-900">
                  {currency}
                  {order.amount}
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-2 mt-4">
                  <select
                    onChange={(e) => statusHandler(e, order._id)}
                    className="p-2 font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    value={order.status}>
                    <option value={order.status}>{order.status}</option>
                    {nextStatus && (
                      <option value={nextStatus}>{nextStatus}</option>
                    )}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SellerOrder;
