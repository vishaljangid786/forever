import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";
import { toast } from "react-toastify";

const Orders = () => {
  const { token, currency } = useContext(ShopContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [orderData, setOrderData] = useState([]);

  const loadOrderData = async () => {
    try {
      if (!token) return;
  
      const response = await axios.get(`${backendUrl}/api/order/userorders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.data.success) {
        let allOrdersItem = [];
  
        for (const order of response.data.orders) {
          for (const item of order.items) {
            try {
              const productResponse = await axios.post(
                `${backendUrl}/api/product/single`,
                { productId: item.productId }
              );
  
              const product = productResponse.data.product;
  
              allOrdersItem.push({
                ...item,
                status: order.status,
                orderId: order._id,
                payment: order.payment,
                paymentMethod: order.paymentMethod,
                date: order.date,
                name: product?.name || "Unknown Product",
                price: item?.price,
                image: product?.image || [],
              });
            } catch (err) {
              console.warn(`Product not found for ID: ${item.productId}`, err);
  
              // Still push order item with limited info
              allOrdersItem.push({
                ...item,
                status: order.status,
                orderId: order._id,
                payment: order.payment,
                paymentMethod: order.paymentMethod,
                date: order.date,
                name: "Product Not Found",
                price: item?.price,
                image: [],
              });
            }
          }
        }
  
        setOrderData(allOrdersItem.reverse());
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
    }
  };
  

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      await axios.post(
        `${backendUrl}/api/order/delete`,
        { orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Order deleted successfully!");
      loadOrderData(); // Refresh orders
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete order.");
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className="pt-16">
      <div className="mb-8 text-3xl font-semibold text-center text-gray-800 dark:text-gray-200">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      <div className="max-w-6xl p-6 mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <hr className="border-gray-300 dark:border-gray-600" />

        {orderData.length === 0 ? (
          <p className="mt-6 text-lg text-center text-gray-500 dark:text-gray-400">
            No orders yet.
          </p>
        ) : (
          <div className="space-y-8">
            {[...orderData].reverse().map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-6 p-5 transition-shadow duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-lg md:flex-row">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <img
                    src={item.image?.[0] || "/placeholder.jpg"}
                    alt={item.name || "Product Image"}
                    className="object-contain border rounded-md w-28 h-28"
                  />
                </div>

                {/* Order Details */}
                <div className="flex-1">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Order #{index + 1}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-3 w-3 rounded-full ${
                          item.status === "Delivered"
                            ? "bg-green-500"
                            : item.status === "Processing"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}></span>
                      <p className="text-sm font-medium">{item.status}</p>
                    </div>
                  </div>
                  {item.status !== "Delivered" &&
                    item.status !== "Out for delivery" && (
                      <button
                        onClick={() => handleDeleteOrder(item.orderId)}
                        className="px-4 py-2 mt-2 text-sm text-white transition bg-red-500 dark:bg-red-600 rounded hover:bg-red-600 md:mt-0">
                        Delete Order
                      </button>
                    )}

                  {/* Order Content */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300 md:grid-cols-3">
                    <div>
                      <p className="font-semibold">Product Name:</p>
                      <p>{item.name}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Price:</p>
                      <p>
                        {currency}
                        {item.price}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">Quantity:</p>
                      <p>{item.quantity}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Color:</p>
                      <p>{item.color}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Size:</p>
                      <p>{item.size || "N/A"}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Order Date:</p>
                      <p>{new Date(item.date).toDateString()}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Payment Method:</p>
                      <p>{item.paymentMethod}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
