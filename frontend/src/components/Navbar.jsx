import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
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
      className="flex items-center sticky top-0  left-0 bg-white border-b z-50 justify-between py-5 font-medium px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <Link to="/" className="flex items-center gap-3">
        <img
          src={assets.logo}
          draggable={false}
          className="w-12"
          alt=""
        />
      </Link>
      {userData && (
        <p className="hidden text-lg text-gray-600 sm:block">
          Welcome,
          {userData?.name?.split(" ")[0]?.charAt(0).toUpperCase() +
            userData?.name?.split(" ")[0]?.slice(1).toLowerCase()}
        </p>
      )}

      <ul className="items-center hidden gap-5 text-sm text-gray-700 lg:flex">
        <NavLink to="/" className="flex flex-col items-center gap-1">
          <p>HOME</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/collection" className="flex flex-col items-center gap-1">
          <p>COLLECTION</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/about" className="flex flex-col items-center gap-1">
          <p>ABOUT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/contact" className="flex flex-col items-center gap-1">
          <p>CONTACT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
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
            <p className="hidden text-gray-500 sm:block">
              PP: {formatNumber(userData?.cc)}, {formatNumber(userData?.left)}, {formatNumber(userData?.right)}
            </p>

          </>
        )}
        <img
          onClick={handleSearchClick}
          src={assets.search_icon}
          className="w-5 cursor-pointer"
          alt=""
        />

        <div className="relative group">
          <img
            onClick={() => (token ? null : navigate("/login"))}
            className="w-5 cursor-pointer"
            src={assets.profile_icon}
            alt=""
          />

          {token && (
            <div className="absolute right-0 z-[999] hidden group-hover:block dropdown-menu pt-4">
              <div className="flex flex-col gap-2 px-5 py-4 transition-all duration-300 ease-in-out bg-white border border-gray-200 shadow-xl w-44 rounded-xl">
                <p
                  onClick={() => navigate("/myprofile")}
                  className="text-gray-600 transition-colors duration-200 cursor-pointer hover:text-blue-600 hover:font-medium">
                  My Profile
                </p>
                <p
                  onClick={() => navigate("/orders")}
                  className="text-gray-600 transition-colors duration-200 cursor-pointer hover:text-blue-600 hover:font-medium">
                  Orders
                </p>
                <p
                  onClick={() => navigate("/refferedUsers")}
                  className="text-gray-600 transition-colors duration-200 cursor-pointer hover:text-blue-600 hover:font-medium">
                  Referred Users
                </p>
                <p
                  onClick={() => navigate("/levelIncome")}
                  className="text-gray-600 transition-colors duration-200 cursor-pointer hover:text-blue-600 hover:font-medium">
                  Level Income
                </p>
                <p
                  onClick={() => navigate("/addmember")}
                  className="text-gray-600 transition-colors duration-200 cursor-pointer hover:text-blue-600 hover:font-medium">
                  Add Member
                </p>
                <p
                  onClick={() => navigate("/team")}
                  className="text-gray-600 transition-colors duration-200 cursor-pointer hover:text-blue-600 hover:font-medium">
                  Team
                </p>
                <p
                  onClick={() => navigate("/bills")}
                  className="text-gray-600 transition-colors duration-200 cursor-pointer hover:text-blue-600 hover:font-medium">
                  My Bills
                </p>
                <p
                  onClick={logout}
                  className="text-red-500 transition-colors duration-200 cursor-pointer hover:text-red-600 hover:font-medium">
                  Logout
                </p>
              </div>
            </div>
          )}
        </div>
        <Link to="/cart" className="relative">
          <img src={assets.cart_icon} className="w-5 min-w-5" alt="" />
          <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
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
        className={`absolute z-10 top-0 h-screen right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? "w-full" : "w-0"
          }`}>
        <div className="flex flex-col text-gray-600">
          <div
            onClick={() => setVisible(false)}
            className="flex items-center gap-4 p-3 cursor-pointer">
            <img className="h-4 rotate-180" src={assets.dropdown_icon} alt="" />
            <p>Back</p>
          </div>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/">
            HOME
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/collection">
            COLLECTION
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/about">
            ABOUT
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/contact">
            CONTACT
          </NavLink>
          <div
            className="py-2 pl-6 border"
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
          <div className="relative w-full p-6 mx-5 bg-white rounded-md sm:w-96">
            <h2 className="mb-4 text-2xl font-bold text-center text-rose-500">
              Enjoy 20% off
            </h2>
            <i
              onClick={() => setIsReferralDialogOpen(false)}
              className="absolute top-0 right-0 p-3 border cursor-pointer rounded-bl-md rounded-tr-md fa-solid fa-x"></i>
            <p className="mb-4 text-center">Click on referral code to copy</p>
            <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
              <p
                className="p-2 px-5 text-xl border cursor-pointer"
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
