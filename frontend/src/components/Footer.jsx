import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <div>
      <div className="flex flex-col sm:grid border-t grid-cols-[3fr_1fr_1fr] gap-14 mt-10 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] py-10 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-5">
            <img src={assets.logo} className="w-16" alt="" />
          </div>
          <p className="w-full text-gray-600 md:w-2/3">
            At VK All In Marketing, we are dedicated to delivering top-notch
            digital solutions that help businesses thrive. From innovative
            marketing strategies to cutting-edge design, we provide services
            that make a real impact. Our commitment to excellence has made us a
            trusted name in the industry. Let's grow together!
          </p>
        </div>

        <div>
          <p className="mb-5 text-xl font-medium">COMPANY</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <Link to="/">Home</Link>
            <Link to="/about">About us</Link>
            <Link to="/terms&conditions">Terms & Conditions</Link>
            <Link to="/privacy-policy">Privacy policy</Link>
          </ul>
        </div>

        <div>
          <p className="mb-5 text-xl font-medium">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>+91 9462365447</li>
            <li>vkallinmarketing@gmail.com</li>
          </ul>
        </div>
      </div>

      <div>
        <hr />
        <p className="py-5 text-sm text-center">
          Copyright 2025@ vkallinmarketing@gmail.com - All Right Reserved.
        </p>
      </div>
    </div>
  );
}

export default Footer
