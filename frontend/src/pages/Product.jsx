import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import RelatedProducts from "../components/RelatedProducts";
import DescRev from "../components/DescRev";
import { toast } from "react-toastify";

const Product = () => {
  const { productId } = useParams();
  const { token, products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState();
  const [color, setColor] = useState("");
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

const renderStars = () => {
    const fullStars = Math.floor(averageRating); // Count of full stars
    const hasHalfStar = averageRating % 1 >= 0.3 && averageRating % 1 <= 0.7; // Show half-star for ratings like 3.5, 4.3, etc.
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0); // Remaining empty stars

    return (
      <div className="flex items-center space-x-1">
        {/* Full Stars */}
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-xl text-yellow-500">
            ★
          </span>
        ))}

        {/* Half Star */}
        {hasHalfStar && (
          <span className="relative w-4 h-4 mb-3 text-xl">
            {/* Gray Star (Background) */}
            <span className="absolute text-gray-300">★</span>
            {/* Half Star (Foreground) */}
            <span className="absolute text-yellow-500">⯨</span>
          </span>
        )}

        {/* Empty Stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-xl text-gray-300">
            ★
          </span>
        ))}
      </div>
    );
  };

  useEffect(() => {
    const product = products.find((item) => item._id === productId);
    if (product) {
      setProductData(product);
      if (!size && product.sizes && product.sizes.length > 0) {
        setSize(product.sizes[0]);
      }
      if (!color && product.color && product.color.length > 0) {
        setColor(product.color[0]);
      }
      
    }
  }, [productId, products]);

  useEffect(() => {
    if (productData?.image?.length > 1 && !isHovering) {
      const interval = setInterval(() => {
        setImageIndex(
          (prevIndex) => (prevIndex + 1) % productData.image.length
        );
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [productData, isHovering]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    const cursorX = e.clientX;
    const cursorY = e.clientY;

    setZoomPosition({
      x,
      y,
      cursorX: cursorX - 250,
      cursorY: cursorY - 100,
    });
  };

  const handleAddToCart = async () => {
    if (!token) {
      toast.error("Please login to add items to cart");
      return;
    }
    if (productData.sizes && productData.sizes.length > 0 && !size) {
      toast.error("Please select a size");
      return;
    }
    try {
      await addToCart({
        productId: productData._id,
        price: currentPrice,
        size: size,
        color: color,
        quantity: 1,
      });
    } catch (error) {
      toast.error("Failed to add product to cart");
    }
  };

  const colors = productData?.color;
  const sizeIndex = productData?.sizes?.indexOf(size);
  // helper that can interpret either number arrays or comma-separated strings
  const parsePrice = (arr, idx) => {
    if (!arr || idx < 0) return 0;
    const first = arr[0];
    if (typeof first === "string") {
      const parts = first.split(",");
      return Number(parts[idx] ?? parts[0] ?? 0);
    } else if (typeof first === "number") {
      // if numeric array just use the value at index or fallback to first entry
      return Number(arr[idx] ?? first ?? 0);
    }
    return 0;
  };

  const currentPrice = sizeIndex !== -1 ? parsePrice(productData?.price, sizeIndex) : 0;
  const oldPrice = sizeIndex !== -1 ? parsePrice(productData?.oldPrice, sizeIndex) : 0;

  return productData ? (
    <div className="z-0 pt-10 border-t-2">
      <div className="flex flex-col gap-12 sm:flex-row">
        <div className="flex flex-col-reverse flex-1 gap-3 sm:flex-row">
          <div className="flex gap-3 sm:flex-col  overflow-x-auto sm:w-[18%] w-full scrollbar-hide">
            {productData.image.map((item, index) => (
              <img
                key={index}
                src={item}
                onClick={() => setImageIndex(index)}
                className={`w-[20%] sm:w-full cursor-pointer object-cover rounded-md 
                ${
                  index === imageIndex
                    ? "border-2 border-pink-500 scale-110"
                    : "opacity-70 hover:opacity-100"
                }`}
                alt="Product thumbnail"
              />
            ))}
          </div>

          <div
            className="relative flex flex-col justify-between  w-full sm:w-[80%] cursor-zoom-in"
            onMouseEnter={() => setIsHovering(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="w-full aspect-[4/3] overflow-hidden">
              <img
                className="object-contain w-full h-full "
                src={productData.image[imageIndex]}
                alt="Product"
              />
            </div>
            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-3">
              {productData.image.map((_, index) => (
                <div
                  key={index}
                  onClick={() => setImageIndex(index)}
                  className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
                    index === imageIndex
                      ? "bg-pink-500 scale-125"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <i
              className="absolute top-0 right-0 text-2xl cursor-pointer text-rose-500 fa-solid fa-share-from-square"
              onClick={() => {
                navigator.clipboard
                  .writeText(window.location.href)
                  .then(() => toast.success("URL copied to clipboard!"))
                  .catch(() => toast.error("Failed to copy URL"));
              }}
            ></i>

            {isHovering && (
              <div
                className="absolute bg-no-repeat w-[150px] h-[150px] border rounded-full border-gray-300 shadow-lg"
                style={{
                  backgroundImage: `url(${productData.image[imageIndex]})`,
                  backgroundSize: "300%",
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  top: `${zoomPosition.cursorY}px`,
                  left: `${zoomPosition.cursorX}px`,
                }}
              />
            )}
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-medium">{productData.name}</h1>
          <p className="flex items-center gap-3 text-3xl font-medium">
            <span className="font-semibold text-red-500">
              {currency}
              {currentPrice}
            </span>

            {oldPrice > 0 && (
              <span className="text-xl text-gray-500 line-through">
                {currency}
                {oldPrice}
              </span>
            )}

            {oldPrice > 0 && currentPrice < oldPrice && (
              <span className="px-2 py-1 text-sm font-bold text-green-600 bg-green-100 rounded-md">
                {Math.round(((oldPrice - currentPrice) / oldPrice) * 100)}% OFF
              </span>
            )}
          </p>

          <p className="text-lg text-gray-700">
            You Won <span>{productData.cc}🪙</span> PP on this product
          </p>
          <div className="flex items-center gap-2">
            {renderStars()}
            <span className="text-gray-500">({reviews.length})</span>
          </div>

          {productData.sizes && productData.sizes.length > 0 && (
            <div className="my-8">
              <p className="mb-2 text-lg font-medium text-gray-700">
                Select Size
              </p>
              <div className="flex flex-wrap gap-3">
                {productData.sizes.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSize(item)}
                    className={`px-5 py-2 border rounded-lg text-sm font-semibold transition-all duration-300
            ${
              item === size
                ? "bg-pink-500 text-white border-pink-500 shadow-lg scale-105"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-pink-100 hover:border-pink-500"
            }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {colors && colors.length > 0 && (
            <div className="flex flex-col gap-2 my-8">
              <p className="mb-2 text-lg font-medium text-gray-700">
                Select Color
              </p>
              <div className="flex flex-wrap gap-4">
                {colors.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex flex-col items-center"
                  >
                    <button
                      onClick={() => setColor(item)}
                      className={`w-fit px-2 h-10 border rounded-lg ${
                        item === color
                          ? "border-pink-500 ring-1 ring-pink-500"
                          : ""
                      }`}
                    >
                      {item === color && (
                        <>
                          <span className="mr-2 font-bold text-black">✓</span>
                        </>
                      )}
                      <span className="mt-1 text-sm text-gray-600 capitalize">
                        {item}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            className="px-8 py-3 text-sm text-white bg-black"
          >
            ADD TO CART
          </button>
          {productData.createdBy && (
            <div className="mt-5 text-sm text-gray-600">
              {productData.createdBy.name && (
                <p>
                  <span className="font-semibold">Created By:</span>{" "}
                  {productData.createdBy.name}
                </p>
              )}
              {productData.createdBy.shopName && (
                <p>
                  <span className="font-semibold">ShopName:</span>{" "}
                  {productData.createdBy.shopName}
                </p>
              )}
              {productData.createdBy.location && (
                <p>
                  <span className="font-semibold">Location:</span>{" "}
                  {productData.createdBy.location}
                </p>
              )}
              {productData.createdBy.address && (
                <p>
                  <span className="font-semibold">Address:</span>{" "}
                  {productData.createdBy.address.street}
                  {","}
                  {productData.createdBy.address.city}
                  {","}
                  {productData.createdBy.address.state}
                  {","}
                  {productData.createdBy.address.country}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <DescRev
        description={productData.description}
        productId={productData?._id}
        setReviews={setReviews}
        reviews={reviews}
        setAverageRating={setAverageRating}
      />
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
