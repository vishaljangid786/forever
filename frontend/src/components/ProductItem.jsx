import React, { useContext, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({ id, image = [], name, price = [], size = [] }) => {
  const { currency } = useContext(ShopContext);

  const productImage = image?.[0] || "/placeholder.png";
  const category = size?.[0] || "Category";

  const formattedPrice = useMemo(() => {
    const rawPrice = price?.[0];
    if (!rawPrice) return `${currency}0`;

    const numeric =
      typeof rawPrice === "string"
        ? parseInt(rawPrice.split(",")[0], 10)
        : rawPrice;

    return `${currency}${numeric.toLocaleString()}`;
  }, [price, currency]);

  return (
    <Link
      to={`/product/${id}`}
      onClick={() => window.scrollTo({ top: 0 })}
      className="group block h-full"
    >
      <div className="relative h-full flex flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-md hover:shadow-2xl border border-slate-200 dark:border-slate-700 transition-all duration-500">

        {/* IMAGE SECTION */}
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-700">

          {/* Product Image */}
          <img
            src={productImage}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500"></div>

          {/* Shine Effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-[-75%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] group-hover:left-[125%] transition-all duration-1000 ease-out"></div>
          </div>

          {/* Buy Now Button */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <button className="px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg shadow-lg backdrop-blur-md">
              Buy Now
            </button>
          </div>
        </div>

        {/* CONTENT SECTION */}
        <div className="flex flex-col flex-1 p-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
              {category}
            </p>

            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-primary-600 transition-colors duration-300">
              {name}
            </h3>
          </div>

          <div className="mt-4">
            <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {formattedPrice}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default React.memo(ProductItem);