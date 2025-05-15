import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({ id, image, name, price,size }) => {
  const { currency } = useContext(ShopContext);
  

  
  return (
    <Link
      onClick={() => scrollTo(0, 0)}
      to={`/product/${id}`}
      className="relative block overflow-hidden transition-all duration-300 transform shadow-md group rounded-xl bg-gradient-to-b from-gray-50 to-gray-100 hover:shadow-2xl hover:-translate-y-2">
      {/* Product Image */}
      <div className="flex items-center justify-center w-full overflow-hidden bg-white h-52">
        <img
          className="object-contain w-full h-full transition duration-300 transform group-hover:scale-110"
          src={image[0]}
          alt={name}
        />
      </div>

      {/* Product Details */}
      <div className="p-4">
        <p className="text-lg font-semibold text-gray-900">{name}</p>
        <p className="mt-1 text-base font-medium text-gray-700">
          {currency}
          {parseInt(price[0])}
        </p>
      </div>

      {/* Floating Buy Button */}
      <button className="absolute px-4 py-2 text-sm text-white transition-all duration-300 bg-blue-600 rounded-full shadow-md opacity-0 bottom-4 right-4 group-hover:opacity-100">
        Buy Now
      </button>
    </Link>
  );
};

export default ProductItem;
