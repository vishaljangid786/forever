import React from "react";
import ProductItem from "./ProductItem";

const CategoryProducts = ({ categoriesList, filterProducts, showMore, toggleShowMore }) => {

  // Step 1: Count products per category
  const categoryCount = categoriesList.map((category) => {
    const count = filterProducts.filter(
      (item) => item.category === category
    ).length;

    return { category, count };
  });

  // Step 2: Sort by count (descending) & take top 5
  const topCategories = categoryCount
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((item) => item.category);

  return (
    <>
      {topCategories.map((category, categoryIndex) => {
        const categoryProducts = filterProducts.filter(
          (item) => item.category === category
        );

        const initialProducts = categoryProducts.slice(0, 8);
        const remainingProducts = categoryProducts.slice(8);

        return (
          <div key={categoryIndex} className="mb-8">
            <h3 className="text-xl font-semibold mb-4">{category}</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {initialProducts.map((item, index) => (
                <ProductItem key={index} {...item} id={item._id} />
              ))}

              {showMore[category] &&
                remainingProducts.map((item, index) => (
                  <ProductItem key={index + 8} {...item} id={item._id} />
                ))}
            </div>

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
      })}
    </>
  );
};

export default CategoryProducts;