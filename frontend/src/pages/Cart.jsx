import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import Loading from "../components/Loading";
import { ThemeContext } from "../context/ThemeContext";

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    updateCartItem,
    removeFromCart,
    loading,
    delivery_fee,
  } = useContext(ShopContext);

  const navigate = useNavigate();
  const [cartData, setCartData] = useState([]);
  const {isDark} = useContext(ThemeContext)

  useEffect(() => {
    if (products.length > 0) {
      const tempData = cartItems
        .filter((item) => item && item.productId) // Filter out items with missing data
        .map((item) => ({
          cartItemId: item?._id,
          productId: item.productId._id,
          name: item.productId.name,
          image: item.productId.image?.[0],
          price: Number(item.price),
          size: item.size,
          color: item.color,
          category: item.productId.category,
          quantity: item.quantity,
        }));

      setCartData(tempData);
    }
  }, [cartItems, products]);

  const subtotal = cartData.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const handleCheckout = () => {
    navigate("/place-order", {
      state: {
        subtotal, // pass subtotal if needed
      },
    });
  };

  const shippingFee = delivery_fee;
  const totalPrice = subtotal + shippingFee;

  if (loading) return <Loading />;

  if (cartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-1/2">
        <div className={`p-6  my-20 text-center ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'} rounded-lg shadow-lg`}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
            alt="Empty Cart"
            className="w-32 mx-auto"
          />
          <p className={`mt-4 text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-700'} `}>
            Your cart is empty!
          </p>
          <p className="mt-2 text-gray-500">
            Start adding products to see them here.
          </p>
          <button
            onClick={() => navigate("/collection")}
            className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Shop Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto">
      <Title text1="Shopping" text2="Cart" />

      <div className="w-full space-y-6">
        {cartData.map((item) => (
          <div
            key={item.cartItemId}
            className="relative flex flex-wrap items-center justify-between gap-4 p-5 bg-white border rounded-lg shadow-md md:gap-6">
            <img
              src={item.image}
              alt={item.name}
              className="object-contain w-20 h-20 rounded-md"
            />

            <div className="flex flex-col w-1/3 md:w-1/4">
              <h3 className="text-sm font-semibold sm:text-lg">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.category}</p>
            </div>

            <p className="w-1/4 text-lg text-gray-600">
              {currency}
              {Number(item.price)}
            </p>

            <p className="w-1/4 text-sm text-gray-600">
              <span className="font-medium">Size:</span> {item.size}
            </p>
            <p className="w-1/4 text-sm text-gray-600">
              <span className="font-medium">Color:</span> {item.color}
            </p>

            <select
              value={item.quantity}
              onChange={(e) => {
                // Update the cart item with the new quantity
                updateCartItem({
                  productId: item.productId,
                  color: item.color,
                  size: item.size,
                  quantity: Number(e.target.value),
                });

                // Trigger page reload after updating the cart
                window.location.reload();
              }}
              className="w-16 px-2 py-1 text-center border rounded-md">
              {[...Array(10).keys()].map((num) => (
                <option key={num + 1} value={num + 1}>
                  {num + 1}
                </option>
              ))}
            </select>

            <button
              onClick={() => removeFromCart(item.cartItemId)}
              className="text-gray-500 hover:text-red-600">
              <FaTrash className="text-xl" />
            </button>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="p-6 mt-8 bg-white border rounded-lg shadow-lg">
        <h3 className="mb-4 text-xl font-semibold">Summary</h3>
        <div className="flex justify-between mb-2">
          <span>Subtotal:</span>
          <span>
            {currency}
            {subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Shipping:</span>
          <span>
            {currency}
            {shippingFee.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-lg font-semibold">
          <span>Total:</span>
          <span>
            {currency}
            {totalPrice.toFixed(2)}
          </span>
        </div>
        <button
          onClick={handleCheckout}
          className="w-full px-6 py-3 mt-4 text-white bg-green-600 rounded-lg hover:bg-green-700">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
