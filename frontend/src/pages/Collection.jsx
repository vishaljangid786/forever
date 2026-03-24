import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import axios from "axios";

const Collection = () => {
  const { products, search, showSearch, productsLoading } =
    useContext(ShopContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relavent");

  // States to store the categories and subcategories fetched from the API
  const [categoriesList, setCategoriesList] = useState([]);
  const [subCategoriesList, setSubCategoriesList] = useState([]);

  // States for toggling visibility of additional categories and subcategories
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [showMoreSubCategories, setShowMoreSubCategories] = useState(false);
  const [showMore, setShowMore] = useState({}); // Object to manage visibility of products for each category

  // Function to toggle the visibility of products
  const toggleShowMore = (category) => {
    setShowMore((prev) => ({
      ...prev,
      [category]: !prev[category], // Toggle the "show more" state for the clicked category
    }));
  };

  // Function to toggle category filter
  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCategory((prev) => [...prev, e.target.value]);
    }
  };

  // Function to toggle subcategory filter
  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setSubCategory((prev) => [...prev, e.target.value]);
    }
  };

  // Function to apply the filter based on selected categories and subcategories
  const applyFilter = () => {
    let productsCopy = products?.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (category?.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category),
      );
    }

    if (subCategory?.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        subCategory.includes(item.subCategory),
      );
    }

    setFilterProducts(productsCopy);
  };

  // Function to sort the filtered products
  const sortProduct = () => {
    let fpCopy = filterProducts?.slice();

    switch (sortType) {
      case "low-high":
        setFilterProducts(fpCopy.sort((a, b) => a.price - b.price));
        break;

      case "high-low":
        setFilterProducts(fpCopy.sort((a, b) => b.price - a.price));
        break;

      default:
        applyFilter();
        break;
    }
  };

  // Fetch categories and subcategories when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/product/fetchcategories`,
        );

        setCategoriesList(response.data.categories);
        setSubCategoriesList(response.data.subCategories);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, showSearch, products]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  return (
    <div className="flex flex-col gap-1 pt-10 sm:flex-row sm:gap-10">
      {/* Filter Options */}
      <div className="min-w-60">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-2 my-2 text-xl cursor-pointer"
        >
          FILTERS
          <img
            className={`h-3 sm:hidden ${showFilter ? "rotate-90" : ""}`}
            src={assets.dropdown_icon}
            alt=""
          />
        </p>
        ￼Girls Show More
        {/* Category Filter */}
        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            {categoriesList?.slice(0, 3).map((cat, index) => (
              <p key={index} className="flex gap-2">
                <input
                  className="w-3"
                  type="checkbox"
                  value={cat}
                  onChange={toggleCategory}
                />{" "}
                {cat}
              </p>
            ))}
            {showMoreCategories &&
              categoriesList?.slice(3).map((cat, index) => (
                <p key={index + 3} className="flex gap-2">
                  <input
                    className="w-3"
                    type="checkbox"
                    value={cat}
                    onChange={toggleCategory}
                  />{" "}
                  {cat}
                </p>
              ))}
            {categoriesList?.length > 3 && (
              <p
                onClick={() => setShowMoreCategories(!showMoreCategories)}
                className="text-blue-500 cursor-pointer"
              >
                {showMoreCategories ? "Show Less" : "Show More"}
              </p>
            )}
          </div>
        </div>
        {/* SubCategory Filter */}
        <div
          className={`border border-gray-300 pl-5 py-3 my-5 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">TYPE</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            {subCategoriesList?.slice(0, 3).map((subCat, index) => (
              <p key={index} className="flex gap-2">
                <input
                  className="w-3"
                  type="checkbox"
                  value={subCat}
                  onChange={toggleSubCategory}
                />{" "}
                {subCat}
              </p>
            ))}
            {showMoreSubCategories &&
              subCategoriesList?.slice(3).map((subCat, index) => (
                <p key={index + 3} className="flex gap-2">
                  <input
                    className="w-3"
                    type="checkbox"
                    value={subCat}
                    onChange={toggleSubCategory}
                  />{" "}
                  {subCat}
                </p>
              ))}
            {subCategoriesList?.length > 3 && (
              <p
                onClick={() => setShowMoreSubCategories(!showMoreSubCategories)}
                className="text-blue-500 cursor-pointer"
              >
                {showMoreSubCategories ? "Show Less" : "Show More"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1">
        <div className="flex justify-between mb-4 text-base sm:text-2xl">
          <Title text1={"ALL"} text2={"COLLECTIONS"} />

          {/* Product Sort */}
          <select
            onChange={(e) => setSortType(e.target.value)}
            className="px-2 text-sm border-2 border-gray-300"
          >
            <option value="relavent">Sort by: Relavent</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>

        {/* Loading Indicator */}
        {productsLoading && (
          <div className="py-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(12)
                .fill(null)
                .map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-300 dark:bg-gray-700 w-full aspect-square rounded-lg mb-3"></div>
                    <div className="bg-gray-200 dark:bg-gray-600 h-4 w-3/4 rounded mb-2"></div>
                    <div className="bg-gray-200 dark:bg-gray-600 h-4 w-1/2 rounded"></div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Product Categories Section - Only show when not loading */}
        {!productsLoading && (
          <>
            {/* Categories with 8 or more products */}
            {categoriesList?.map((category, categoryIndex) => {
              // Filter products by category
              const categoryProducts = filterProducts.filter(
                (item) => item.category === category,
              );

              // Only display categories with 8 or more products
              if (categoryProducts.length >= 8) {
                const initialProducts = categoryProducts.slice(0, 8);
                const remainingProducts = categoryProducts.slice(8);

                return (
                  <div key={categoryIndex} className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">{category}</h3>

                    {/* Product items for the category - Grid Layout */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {initialProducts.map((item, index) => (
                        <ProductItem
                          key={index}
                          name={item.name}
                          size={item.sizes}
                          id={item._id}
                          price={item.price}
                          image={item.image}
                          className="w-full"
                        />
                      ))}
                      {showMore[category] &&
                        remainingProducts.map((item, index) => (
                          <ProductItem
                            key={index + 8}
                            name={item.name}
                            size={item.sizes}
                            id={item._id}
                            price={item.price}
                            image={item.image}
                            className="w-full"
                          />
                        ))}
                    </div>

                    {/* Show More button */}
                    {remainingProducts.length > 0 && (
                      <button
                        onClick={() => toggleShowMore(category)}
                        className="mt-4 text-blue-500"
                      >
                        {showMore[category] ? "Show Less" : "Show More"}
                      </button>
                    )}
                  </div>
                );
              }
              return null;
            })}

            {/* Categories with less than 8 products */}
            <div className="mt-10">
              {/* {categoriesList?.map((category, categoryIndex) => {
                const categoryProducts = filterProducts.filter(
                  (item) => item.category === category,
                );

                if (categoryProducts.length < 8) {
                  return (
                    <div key={categoryIndex} className="mb-8">
                      {categoryProducts.length > 0 && (
                        <h3 className="text-xl font-semibold mb-4">
                          {category}
                        </h3>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categoryProducts.map((item, index) => (
                          <ProductItem
                            key={index}
                            name={item.name}
                            size={item.sizes}
                            id={item._id}
                            price={item.price}
                            image={item.image}
                            className="w-full"
                          />
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })} */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
  {filterProducts.map((item, index) => (
    <ProductItem
      key={index}
      name={item.name}
      size={item.sizes}
      id={item._id}
      price={item.price}
      image={item.image}
    />
  ))}
</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Collection;
