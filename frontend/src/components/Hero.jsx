import React, { useContext, useEffect, useState, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';

const Hero = () => {
  const { products } = useContext(ShopContext);
  const [currentImage, setCurrentImage] = useState('');
  const [fade, setFade] = useState(true);
  const intervalRef = useRef(null); // ⬅️ prevent multiple intervals

  useEffect(() => {
    if (!products || products.length === 0) return;

    const getRandomImage = () => {
      const randomIndex = Math.floor(Math.random() * products.length);
      return products[randomIndex]?.image?.[0] || '';
    };

    // Set the initial image
    setCurrentImage(getRandomImage());

    // Clear any existing interval
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Set interval once
    intervalRef.current = setInterval(() => {
      setFade(false); // fade out
      setTimeout(() => {
        setCurrentImage(getRandomImage());
        setFade(true); // fade in
      }, 500); // must match transition
    }, 5000);

    // Clean up
    return () => clearInterval(intervalRef.current);
  }, [products?.length]); // Only rerun if product count changes



  return (
    <div className='z-0 flex flex-col border-gray-400 sm:flex-row'>
      {/* Hero Left Side */}
      <div className='flex items-center justify-center scale-125 w-full py-10 sm:w-1/2 sm:py-0'>
        <div className='text-[#414141] my-20'>
          <div className='flex items-center gap-2'>
            <p className='w-8 md:w-11 h-[2px] bg-[#414141]'></p>
            <p className='text-sm font-medium md:text-base'>OUR BESTSELLERS</p>
          </div>
          <a href="#bestSeller" className='text-3xl leading-relaxed prata-regular sm:py-3 xl:text-5xl'>
            Latest Arrivals
          </a>
          <div className='flex items-center gap-2'>
            <Link to="/collection" className='text-sm font-semibold md:text-base'>SHOP NOW</Link>
            <p className='w-8 md:w-11 h-[1px] bg-[#414141]'></p>
          </div>
        </div>
      </div>

      {/* Hero Right Side - Animated Product Image */}
      <div className='w-full sm:w-1/2'>
        <img
          src={currentImage}
          alt="product"
          draggable={false}
          className={`w-full sm:h-[800px] h-1/2 sm:scale-75 scale-100 mx-auto object-cover rounded-xl transition-opacity duration-500 ease-in-out ${fade ? 'opacity-100' : 'opacity-0'
            }`}
        />


      </div>
    </div>
  );
};

export default Hero;
