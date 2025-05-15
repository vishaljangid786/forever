import React, { useContext, useState, useEffect } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { redirect, useLocation, useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [method, setMethod] = useState("cod");
  // const navigate = useNavigate();
  
  const {
    navigate,
    token,
    cartItems,
    getCartAmount,
    delivery_fee,
    userData,
    removeFromCart,
  } = useContext(ShopContext);
  if (!cartItems || cartItems.length === 0) {
    navigate("/");
  }


  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });
  const location = useLocation();
  const { subtotal } = location.state || {};

  // Only set formData once when userData is first loaded
  useEffect(() => {
    if (userData && !formData.firstName && !formData.lastName) {
      const name = userData.name || "";
      const [firstName, ...lastName] = name.split(" ");
      setFormData((prev) => ({
        ...prev,
        firstName: firstName || "",
        lastName: lastName.length > 0 ? lastName.join(" ") : "",
        email: userData.email || "",
        street: userData.address?.street || "",
        city: userData.address?.city || "",
        state: userData.address?.state || "",
        zipcode: userData.address?.zipcode || "",
        country: userData.location || "",
        phone: userData.phone || "",
      }));
    }
  }, [userData]);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (!cartItems || cartItems.length === 0) {
        toast.error("Your cart is empty");
        return;
      }

      let orderItems = cartItems.map((item) => ({
        productId: item.productId._id,
        name: item.productId.name,
        price: item.price,
        quantity: item.quantity,
        image: item.productId.image[0],
        size: item.size || "default",
        color: item.color,
      }));

      if (
        !formData.street ||
        !formData.city ||
        !formData.state ||
        !formData.zipcode ||
        !formData.country
      ) {
        toast.error("Please fill out the complete address");
        return;
      }

      // Prepare user data to be sent in the request
      const updatedUserData = {
        userId: userData?._id,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipcode: formData.zipcode,
          country: formData.country,
        },
      };

      let orderData = {
        userId: userData?._id,
        userDetails: { ...userData },
        address: { ...formData },
        items: orderItems,
        amount: subtotal + delivery_fee,
      };

      const headers = { Authorization: `Bearer ${token}` };

      await axios.put(`${backendUrl}/api/user/update`, updatedUserData, {
        headers,
      });

      let response;
      if (method === "cod") {
        response = await axios.post(
          `${backendUrl}/api/order/place`,
          orderData,
          { headers }
        );
      } else if (method === "stripe") {
        response = await axios.post(
          `${backendUrl}/api/order/stripe`,
          orderData,
          { headers }
        );
      } else if (method === "razorpay") {
        response = await axios.post(
          `${backendUrl}/api/order/razorpay`,
          orderData,
          { headers }
        );
      }

      if (response.data.success) {
        toast.success("Order placed successfully");
        orderItems.forEach((item) => removeFromCart(item.productId));
        navigate("/orders");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Order placement error:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
    }
  };

  return (
    <form
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t"
      onSubmit={onSubmitHandler}>
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <Title text1="DELIVERY" text2="INFORMATION" />
        <input
          onChange={onChangeHandler}
          name="firstName"
          value={formData.firstName}
          className="border rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="First name"
        />
        <input
          onChange={onChangeHandler}
          name="lastName"
          value={formData.lastName}
          className="border rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="Last name"
        />
        <input
          onChange={onChangeHandler}
          name="email"
          disabled
          value={formData.email}
          className="border rounded py-1.5 px-3.5 w-full"
          type="email"
          placeholder="Email address"
        />
        <input
          onChange={onChangeHandler}
          name="street"
          value={formData.street}
          className="border rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="Street"
        />
        <input
          onChange={onChangeHandler}
          name="city"
          value={formData.city}
          className="border rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="City"
        />
        <input
          onChange={onChangeHandler}
          name="state"
          value={formData.state}
          className="border rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="State"
        />
        <input
          onChange={onChangeHandler}
          name="zipcode"
          value={formData.zipcode}
          className="border rounded py-1.5 px-3.5 w-full"
          type="number"
          placeholder="Zipcode"
        />
        <input
          onChange={onChangeHandler}
          name="country"
          value={formData.country}
          className="border rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="Country"
        />
        <input
          onChange={onChangeHandler}
          name="phone"
          value={formData.phone}
          className="border rounded py-1.5 px-3.5 w-full"
          type="number"
          placeholder="Phone"
        />
      </div>

      <div className="mt-8">
        <CartTotal />
        <Title text1="PAYMENT" text2="METHOD" />
        <div className="flex flex-col gap-3 lg:flex-row">
          <div
            onClick={() => setMethod("stripe")}
            className="flex items-center gap-3 p-2 px-3 border cursor-pointer">
            <p
              className={`w-3.5 h-3.5 border rounded-full ${
                method === "stripe" ? "bg-green-400" : ""
              }`}></p>
            <img className="h-5 mx-4" src={assets.stripe_logo} alt="Stripe" />
          </div>
          <div
            onClick={() => setMethod("razorpay")}
            className="flex items-center gap-3 p-2 px-3 border cursor-pointer">
            <p
              className={`w-3.5 h-3.5 border rounded-full ${
                method === "razorpay" ? "bg-green-400" : ""
              }`}></p>
            <img
              className="h-5 mx-4"
              src={assets.razorpay_logo}
              alt="Razorpay"
            />
          </div>
          <div
            onClick={() => setMethod("cod")}
            className="flex items-center gap-3 p-2 px-3 border cursor-pointer">
            <p
              className={`w-3.5 h-3.5 border rounded-full ${
                method === "cod" ? "bg-green-400" : ""
              }`}></p>
            <p className="mx-4 text-sm font-medium text-gray-500">
              CASH ON DELIVERY
            </p>
          </div>
        </div>
        <div className="w-full mt-8 text-end">
          <button
            type="submit"
            className="px-16 py-3 text-sm text-white bg-black">
            PLACE ORDER
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
