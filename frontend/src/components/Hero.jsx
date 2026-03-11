import React, { useContext, useEffect, useState, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';

const Hero = () => {
  const { products } = useContext(ShopContext);
  const [currentImage, setCurrentImage] = useState('');
  const [fade, setFade] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!products || products.length === 0) return;

    const getRandomImage = () => {
      const randomIndex = Math.floor(Math.random() * products.length);
      return products[randomIndex]?.image?.[0] || '';
    };

    setCurrentImage(getRandomImage());

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentImage(getRandomImage());
        setFade(true);
      }, 500);
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, [products?.length]);

  return (
    <div className='relative w-full min-h-screen lg:min-h-[700px] grid grid-cols-1 lg:grid-cols-2 gap-8 items-center overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 sm:py-20'>
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 dark:bg-primary-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-100 dark:bg-accent-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>

      {/* Hero Left Side */}
      <div className='flex items-center justify-center px-4 sm:px-8 order-2 lg:order-1'>
        <div className='w-full max-w-lg'>
          <div className='flex items-center gap-3 mb-6 animate-slideUp'>
            <div className='w-12 h-1 bg-gradient-primary rounded-full'></div>
            <p className='text-sm font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400'>Welcome to VJ All In</p>
          </div>

          <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-slate-900 dark:text-white leading-tight animate-slideUp' style={{ animationDelay: '100ms' }}>
            Discover Your <span className='text-primary-600 dark:text-primary-400'>Perfect </span>Style
          </h1>

          <p className='text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed animate-slideUp' style={{ animationDelay: '200ms' }}>
            Explore our latest collection of premium products. From trendy to classic, find exactly what you're looking for with our extensive range.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 animate-slideUp' style={{ animationDelay: '300ms' }}>
            <Link 
              to="/collection" 
              className='px-8 py-4 bg-gradient-primary text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-center'
            >
              Shop Now
            </Link>
            <Link 
              to="/about" 
              className='px-8 py-4 bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 font-semibold rounded-lg border-2 border-primary-600 dark:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 text-center'
            >
              Learn More
            </Link>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-3 gap-4 mt-12 pt-12 border-t border-slate-200 dark:border-slate-700'>
            <div className='text-center animate-slideUp' style={{ animationDelay: '400ms' }}>
              <p className='text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400'>10K+</p>
              <p className='text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1'>Products</p>
            </div>
            <div className='text-center animate-slideUp' style={{ animationDelay: '500ms' }}>
              <p className='text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400'>50K+</p>
              <p className='text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1'>Happy Customers</p>
            </div>
            <div className='text-center animate-slideUp' style={{ animationDelay: '600ms' }}>
              <p className='text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400'>24/7</p>
              <p className='text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1'>Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Right Side - Animated Product Image */}
      <div className='relative h-96 sm:h-[500px] lg:h-[700px] w-full order-1 lg:order-2 flex items-center justify-center px-4' style={{perspective: '1000px'}}>
        <img
          src={currentImage}
          alt="product"
          draggable={false}
          className={`w-full h-full object-contain drop-shadow-2xl transition-all duration-500 ease-in-out ${fade ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          style={{
            filter: 'drop-shadow(0 20px 50px rgba(14, 165, 233, 0.2))'
          }}
        />
      </div>
    </div>
  );
};

export default Hero;
