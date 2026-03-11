import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const ShopContext = createContext(null);

const ShopContextProvider = ({ children }) => {
  const currency = "₹";
  const delivery_fee = 10;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      if (!token) {
        console.log("No token available");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${backendUrl}/api/user/fetchuserdata2`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setUserData(response.data.user);
        setLoading(false);
      } else {
        console.error("Failed to fetch user data:", response.data.message);
        toast.error(response.data.message);
        localStorage.removeItem("token");
        setToken("");
        setLoading(false);
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setToken("");
        navigate("/login");
      }
      toast.error("Failed to fetch user data. Please login again.");
      setLoading(false);
    }
  };

  const fetchCartData = async () => {
    try {
      if (!token) {
        console.error("No token found. User might be logged out.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${backendUrl}/api/cart/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setCartItems(response.data.cart?.items || []); // Ensure cart exists
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (itemData) => {
    try {
      if (!token) {
        toast.error("Please login to add items to cart");
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${backendUrl}/api/cart/add`,
        itemData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        await fetchCartData();
        toast.success("Product added to cart");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.response?.data?.message || "Error adding to cart");
    }
  };

  const removeFromCart = async (productId) => {
    try {
      if (!token) {
        navigate("/login");
        return; // Ensure early exit before toast
      }

      const response = await axios.post(
        `${backendUrl}/api/cart/remove`,
        { productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Item removed from cart");
        // console.log("Updated cart items:", response.data.cart.items); // Log the updated cart items
        setCartItems(response.data.cart.items); // Update the cart state with new items
        fetchCartData(); // Fetch and update cart data (optional)
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error(error.response?.data?.message || "Error removing item");
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      const response = await axios.put(
        backendUrl + `/api/cart/update`,
        { productId: productId.productId, quantity: productId.quantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // ✅ Update cart state immediately
        setCartItems((prevCart) =>
          prevCart.map((item) =>
            item.productId?._id === productId
              ? { ...item, quantity } // Update quantity in state
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error(error.response?.data?.message || "Error updating cart");
    }
  };

  const getCartCount = () => {
    return cartItems?.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const getCartAmount = () => {
    return cartItems
      ?.map((item) => item.price * item.quantity) // Get total price per item
      .reduce((total, price) => total + price, 0); // Sum up all prices
  };

  const getProductsData = async () => {
    try {
      setProductsLoading(true);
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setProductsLoading(false);
    }
  };

  // fetch once on mount; storing `products` in the deps caused repeated requests
  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchCartData();
    } else {
      setUserData(null);
      setCartItems([]);
    }
  }, [token, userData]);

  const contextValue = {
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    products,
    token,
    setToken,
    navigate,
    userData,
    setUserData,
    loading,
    productsLoading,
    addToCart,
    removeFromCart,
    updateCartItem,
    getCartCount,
    getCartAmount,
  };

  return (
    <ShopContext.Provider value={contextValue}>{children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
