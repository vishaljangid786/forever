import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const BestSeller = () => {
  const { products, productsLoading } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    const bestProduct = products.filter(
      (item) => item.bestseller && item.category === 'Phone'
    );
    setBestSeller(bestProduct.slice(0, 5));
  }, [products]);

  return (
    <section id="bestSeller" className="py-16 sm:py-20">
      <div className='px-4 mb-12'>
        <div className='inline-flex flex-col gap-2 w-full'>
          <Title text1={'BEST'} text2={'SELLERS'} />
          <p className='text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto'>
            These are some of the most popular products among our customers. Loved by thousands, explore why they're customer favorites.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 px-4">
        {
          productsLoading ? (
            // Skeleton Loaders
            Array(5).fill(null).map((_, index) => (
              <div key={index} className='animate-pulse'>
                <div className='bg-gray-300 dark:bg-gray-700 w-full aspect-square rounded-lg mb-3'></div>
                <div className='bg-gray-200 dark:bg-gray-600 h-4 w-3/4 rounded mb-2'></div>
                <div className='bg-gray-200 dark:bg-gray-600 h-4 w-1/2 rounded'></div>
              </div>
            ))
          ) : (
            // Actual Products
            bestSeller.map((item, index) => (
              <ProductItem
                key={index}
                id={item._id}
                name={item.name}
                image={item.image}
                price={item.price}
              />
            ))
          )
        }
      </div>

      {/* View All Button */}
      <div className='flex justify-center mt-12'>
        <a href="/collection" className='px-8 py-3 bg-gradient-premium text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300'>
          Explore More Best Sellers
        </a>
      </div>
    </section>
  );
};

export default BestSeller;
