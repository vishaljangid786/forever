import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const LatestCollection = () => {
    const { products, productsLoading } = useContext(ShopContext);
    const [latestProducts, setLatestProducts] = useState([]);

    useEffect(() => {
        setLatestProducts(products.slice(0, 10));
    }, [products])

    return (
        <section className='py-16 sm:py-20'>
            <div className='px-4 mb-12'>
                <div className='inline-flex flex-col gap-2 w-full'>
                    <Title text1={'LATEST'} text2={'COLLECTIONS'} />
                    <p className='text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto'>
                        Discover our newest arrivals with the latest trends and premium quality products handpicked just for you.
                    </p>
                </div>
            </div>

            {/* Rendering Products or Skeleton Loaders */}
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 px-4'>
                {
                    productsLoading ? (
                        // Skeleton Loaders
                        Array(10).fill(null).map((_, index) => (
                            <div key={index} className='animate-pulse'>
                                <div className='bg-gray-300 dark:bg-gray-700 w-full aspect-square rounded-lg mb-3'></div>
                                <div className='bg-gray-200 dark:bg-gray-600 h-4 w-3/4 rounded mb-2'></div>
                                <div className='bg-gray-200 dark:bg-gray-600 h-4 w-1/2 rounded'></div>
                            </div>
                        ))
                    ) : (
                        // Actual Products
                        latestProducts.map((item, index) => (
                            <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} />
                        ))
                    )
                }
            </div>

            {/* View All Button */}
            <div className='flex justify-center mt-12'>
                <a href="/collection" className='px-8 py-3 bg-gradient-primary text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300'>
                    View All Collections
                </a>
            </div>
        </section>
    )
}

export default LatestCollection
