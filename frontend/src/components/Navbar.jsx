import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { ThemeContext } from "../context/ThemeContext";
import { toast } from "react-toastify";
import { useRef } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";


const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [isReferralDialogOpen, setIsReferralDialogOpen] = useState(false);
  const { setShowSearch, getCartCount, token, setToken, userData } =
    useContext(ShopContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const formatNumber = (value) => {
    const num = Number(value);
    if (isNaN(num)) return "0";
    return num % 1 === 0 ? num.toString() : num.toFixed(2);
  };

  const location = useLocation();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navbarRef = useRef(null);

  useEffect(() => {
    // Initialize AOS animation library
    AOS.init({ duration: 1000, easing: "ease-out" });

    // Optional: You can reset AOS animations on scroll or state change
    AOS.refresh();
  }, []);

  // const updateamount = async (userId, cc) => {
  //   if (!userId || cc === undefined) {
  //     console.error("Invalid userId or cc:", { userId, cc });
  //     toast.error("Invalid user details. Please try again.");
  //     return;
  //   }

  //   try {
  //     const response = await axios.post(
  //       `${backendUrl}/api/user/updateamount`,
  //       { userId, cc },
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     if (response.data.success) {
  //       toast.success("Amount updated successfully");
  //     } else {
  //       toast.error("Failed to update amount");
  //     }
  //   } catch (error) {
  //     console.error("Error updating amount:", error.response?.data || error);
  //     toast.error(error.response?.data?.message || "Error updating amount");
  //   }
  // };

  // useEffect(() => {
  //   if (token && userData && userData._id && userData.amount !== undefined) {
  //     updateamount(userData._id, userData.amount);
  //   }
  // }, [token, userData]);



  const logout = () => {
    navigate("/login");
    localStorage.removeItem("token");
    setToken("");
  };

  const handleSearchClick = () => {
    if (location.pathname !== "/collection") {
      toast.error("Please go to the collection page to search.");
    } else {
      setShowSearch(true);
      navigate("/collection");
    }
  };

  const copyReferralCode = () => {
    if (userData?.referralCode) {
      navigator.clipboard
        .writeText(userData.referralCode)
        .then(() => {
          toast.success("Your referral code has been copied!");
        })
        .catch((err) => {
          toast.error("Failed to copy referral code");
        });
    } else {
      toast.error("Referral code not available");
    }
  };


  return (
    <div
      ref={navbarRef}
      data-aos="fade-down"
      className="flex items-center sticky top-0 left-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-50 justify-between py-5 font-medium px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <Link to="/" className="flex items-center gap-3">
        <img
          src={isDark? assets.logo : assets.logodark}
          draggable={false}
          className="w-12"
          alt=""
        />
      </Link>
      {userData && (
        <p className="hidden text-lg text-gray-600 dark:text-gray-300 sm:block">
          Welcome,
          {userData?.name?.split(" ")[0]?.charAt(0).toUpperCase() +
            userData?.name?.split(" ")[0]?.slice(1).toLowerCase()}
        </p>
      )}

      <ul className="items-center hidden gap-5 text-sm text-gray-700 dark:text-gray-300 lg:flex">
        <NavLink to="/" className="flex flex-col items-center gap-1">
          <p>HOME</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 dark:bg-gray-300 hidden" />
        </NavLink>
        <NavLink to="/collection" className="flex flex-col items-center gap-1">
          <p>COLLECTION</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 dark:bg-gray-300 hidden" />
        </NavLink>
        <NavLink to="/about" className="flex flex-col items-center gap-1">
          <p>ABOUT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 dark:bg-gray-300 hidden" />
        </NavLink>
        <NavLink to="/contact" className="flex flex-col items-center gap-1">
          <p>CONTACT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 dark:bg-gray-300 hidden" />
        </NavLink>
        <NavLink
          className="flex flex-col items-center gap-1"
          onClick={() => {
            if (token) {
              setIsReferralDialogOpen(true);
            } else {
              navigate("/login");
              toast.error("Login to Get Your Referral Code");
            }
          }}>
          <p>REFER & EARN 🎁</p>
        </NavLink>
      </ul>
      <div className="flex items-center gap-6 ">
        {userData && (
          <>
            <p className="hidden text-gray-500 dark:text-gray-400 sm:block">
              PP: {formatNumber(userData?.cc)}, {formatNumber(userData?.left)}, {formatNumber(userData?.right)}
            </p>

          </>
        )}
        <button
          onClick={handleSearchClick}
          className="w-5 h-5 flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-110"
          title="Search">
          <svg
            className={`w-5 h-5 transition-colors duration-300 ${
              isDark ? "text-slate-300 hover:text-rose-400" : "text-slate-600 hover:text-rose-600"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>

        {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-5 h-5 flex items-center justify-center cursor-pointer text-xl transition-transform duration-300 hover:scale-110"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          <div className="relative group">
            <button
              onClick={() => (token ? null : navigate("/login"))}
              className="w-5 h-5 flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-110"
              title="Profile">
              <svg
                className={`w-5 h-5 transition-colors duration-300 ${
            isDark ? "text-slate-300 hover:text-rose-400" : "text-slate-600 hover:text-rose-600"
                }`}
                fill="currentColor"
                viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </button>

            {token && (
              <div className="absolute right-0 z-[999] hidden group-hover:block dropdown-menu pt-4">
                <div className="flex flex-col gap-2 px-5 py-4 transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl w-44 rounded-xl">
            <p
              onClick={() => navigate("/myprofile")}
              className="text-slate-700 dark:text-slate-200 transition-colors duration-200 cursor-pointer hover:text-rose-600 dark:hover:text-rose-400 hover:font-medium">
              My Profile
            </p>
            <p
              onClick={() => navigate("/orders")}
              className="text-slate-700 dark:text-slate-200 transition-colors duration-200 cursor-pointer hover:text-rose-600 dark:hover:text-rose-400 hover:font-medium">
              Orders
            </p>
            <p
              onClick={() => navigate("/refferedUsers")}
              className="text-slate-700 dark:text-slate-200 transition-colors duration-200 cursor-pointer hover:text-rose-600 dark:hover:text-rose-400 hover:font-medium">
              Referred Users
            </p>
            <p
              onClick={() => navigate("/levelIncome")}
              className="text-slate-700 dark:text-slate-200 transition-colors duration-200 cursor-pointer hover:text-rose-600 dark:hover:text-rose-400 hover:font-medium">
              Level Income
            </p>
            <p
              onClick={() => navigate("/addmember")}
              className="text-slate-700 dark:text-slate-200 transition-colors duration-200 cursor-pointer hover:text-rose-600 dark:hover:text-rose-400 hover:font-medium">
              Add Member
            </p>
            <p
              onClick={() => navigate("/team")}
              className="text-slate-700 dark:text-slate-200 transition-colors duration-200 cursor-pointer hover:text-rose-600 dark:hover:text-rose-400 hover:font-medium">
              Team
            </p>
            <p
              onClick={() => navigate("/bills")}
              className="text-slate-700 dark:text-slate-200 transition-colors duration-200 cursor-pointer hover:text-rose-600 dark:hover:text-rose-400 hover:font-medium">
              My Bills
            </p>
            <p
              onClick={logout}
              className="text-red-500 dark:text-red-400 transition-colors duration-200 cursor-pointer hover:text-red-600 dark:hover:text-red-300 hover:font-medium">
              Logout
            </p>
                </div>
              </div>
            )}
          </div>
          <Link to="/cart" className="relative">
            <div className="w-5 h-5 flex items-center justify-center">
              <svg
                className={`w-5 h-5 transition-colors duration-300 ${
            isDark ? "text-slate-300 hover:text-rose-400" : "text-slate-600 hover:text-rose-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-rose-500 dark:bg-rose-600 text-white aspect-square rounded-full text-[8px] font-bold">
              {getCartCount()}
            </p>
          </Link>
          <img
            onClick={() => setVisible(true)}
            src={assets.menu_icon}
            className="w-5 cursor-pointer lg:hidden"
            alt=""
          />
              </div>

              {/* Sidebar menu for small screens */}
      <div
        className={`absolute z-10 top-0 h-screen right-0 bottom-0 overflow-hidden bg-white dark:bg-gray-900 transition-all ${visible ? "w-full" : "w-0"
          }`}>
        <div className="flex flex-col text-gray-600 dark:text-gray-300">
          <div
            onClick={() => setVisible(false)}
            className="flex items-center gap-4 p-3 cursor-pointer">
            <img className="h-4 rotate-180" src={assets.dropdown_icon} alt="" />
            <p>Back</p>
          </div>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border border-gray-200 dark:border-gray-700"
            to="/">
            HOME
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border border-gray-200 dark:border-gray-700"
            to="/collection">
            COLLECTION
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border border-gray-200 dark:border-gray-700"
            to="/about">
            ABOUT
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border border-gray-200 dark:border-gray-700"
            to="/contact">
            CONTACT
          </NavLink>
          <div
            className="py-2 pl-6 border border-gray-200 dark:border-gray-700"
            onClick={() => {
              setVisible(false);
              if (token) {
                setIsReferralDialogOpen(true);
              } else {
                toast.error("Login to Get Your Referal Code");
                navigate("/login");
              }
            }}>
            <p>REFER & EARN 🎁</p>
          </div>
        </div>
      </div>

      {/* Referral Code Dialog */}
      {isReferralDialogOpen && (
        <div className="fixed top-0 bottom-0 left-0 right-0 z-50 flex items-center justify-center h-screen bg-black bg-opacity-50">
          <div className="relative w-full p-6 mx-5 bg-white dark:bg-gray-800 rounded-md sm:w-96">
            <h2 className="mb-4 text-2xl font-bold text-center text-rose-500">
              Enjoy 20% off
            </h2>
            <i
              onClick={() => setIsReferralDialogOpen(false)}
              className="absolute top-0 right-0 p-3 border cursor-pointer rounded-bl-md rounded-tr-md fa-solid fa-x"></i>
            <p className="mb-4 text-center text-gray-600 dark:text-gray-300">Click on referral code to copy</p>
            <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
              <p
                className="p-2 px-5 text-xl border cursor-pointer bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600"
                onClick={copyReferralCode}>
                {userData?.referralCode}
              </p>
              <button
                onClick={copyReferralCode}
                className="p-2 px-5 font-bold text-white border-2 border-transparent hover:bg-transparent hover:border-rose-500 hover:text-rose-500 bg-rose-500">
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
