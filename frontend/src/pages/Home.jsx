import React, { useEffect, useState, useContext } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import Hero from "../components/Hero";
import LatestCollection from "../components/LatestCollection";
import BestSeller from "../components/BestSeller";
import OurPolicy from "../components/OurPolicy";
import CategoryProducts from "../components/CategoryProducts";

// ✅ IMPORT CONTEXT
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";

const Home = () => {

  // ✅ GET DATA FROM CONTEXT
  const { products } = useContext(ShopContext);

  const [categoriesList, setCategoriesList] = useState([]);

  const [showMore, setShowMore] = useState({});

  const toggleShowMore = (category) => {
    setShowMore((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // ✅ EXTRACT UNIQUE CATEGORIES FROM PRODUCTS
  useEffect(() => {
    const uniqueCategories = [
      ...new Set(products.map((item) => item.category)),
    ];
    setCategoriesList(uniqueCategories);
  }, [products]);

  // AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-out",
      once: true,
    });
  }, []);

  return (
    <div className="overflow-visible">
      {/* Hero */}
      <div data-aos="zoom-in">
        <Hero />
      </div>

      {/* Latest */}
      <div data-aos="fade-up" data-aos-offset="150">
        <LatestCollection />
      </div>

     

      {/* Best Seller */}
      <div data-aos="fade-up" data-aos-offset="150">
        <BestSeller />
      </div>
       {/* ✅ CATEGORY PRODUCTS (Collection wala UI) */}
      <div data-aos="fade-up" data-aos-offset="150">
         <div className="px-4 mb-12">
        <div className="inline-flex flex-col gap-2  w-full">
          <Title text1={"PRODUCTS BY"} text2={"BY CATEGORIES"} />
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            These are some of the most popular products among our customers.
            Loved by thousands, explore why they're customer favorites.
          </p>
        </div>
      </div>
        <CategoryProducts
          categoriesList={categoriesList}
          filterProducts={products}
          showMore={showMore}
          toggleShowMore={toggleShowMore}
        />
      </div>

      {/* Policy */}
      <div data-aos="fade-up" data-aos-offset="150">
        <OurPolicy />
      </div>
    </div>
  );
};

export default Home;