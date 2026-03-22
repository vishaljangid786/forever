import React from 'react'

const Title = ({ text1, text2 }) => {
  return (
    <div className='inline-flex gap-2 items-center mb-3'>
      
      <p className='text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-500'>
        {text1}{' '}
        <span className='text-gray-700 font-medium'>
          {text2}
        </span>
      </p>

      <p className='w-6 sm:w-8 md:w-10 lg:w-12 h-[1px] sm:h-[2px] bg-gray-700'></p>

    </div>
  )
}

export default Title