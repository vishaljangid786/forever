import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import { useLocation } from 'react-router-dom';

const SearchBar = () => {

    const { search, setSearch, showSearch, setShowSearch } = useContext(ShopContext);
    const [visible, setVisible] = useState(false)
    const location = useLocation();

    useEffect(() => {
        if (location.pathname.includes('collection')) {
            setVisible(true);
        }
        else {
            setVisible(false)
        }
    }, [location])

    return showSearch && visible ? (
        <div className='bg-gradient-to-r mt-10 from-primary-50 to-accent-50 dark:from-slate-800 dark:to-slate-800 border border-primary-100 dark:border-slate-700 rounded-xl py-6 px-4'>
            <div className='flex gap-2 items-center justify-center'>
                <div className='flex-1 max-w-md relative group'>
                    <div className='absolute inset-y-0 left-4 flex items-center pointer-events-none'>
                        <svg className='w-4 h-4 text-slate-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' /></svg>
                    </div>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className='w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-slate-700 border border-primary-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200'
                        type="text"
                        placeholder='Search products...'
                    />
                </div>
                <button
                    onClick={() => setShowSearch(false)}
                    className='p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all duration-200 hover:scale-110'
                >
                    <img className='w-4 h-4' src={assets.cross_icon} alt="Close" />
                </button>
            </div>
        </div>
    ) : null
}

export default SearchBar
