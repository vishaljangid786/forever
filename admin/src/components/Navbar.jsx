import React, { useEffect, useRef, useState } from "react";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";

const Navbar = ({ setToken, userData }) => {
  const fullName = userData?.name || "";
  const [firstName] = fullName.trim().split(/\s+/);
  const priceToPay = userData?.pricetopay || 0;
  const threshold = 100;
  const [showWarning, setShowWarning] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");
  const [level, setLevel] = useState(null);
  const formatNumber = (value) => {
    const num = Number(value);
    if (isNaN(num)) return "0";
    return num % 1 === 0 ? num.toString() : num.toFixed(2);
  };
  

  const blockUser = async (userId) => {
    if (userData.role === "admin") return; // Prevent blocking admin

    try {
      const response = await fetch(`${backendUrl}/api/user/block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.success("You are blocked");
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error(error.message || "Error blocking user");
    }
  };

  useEffect(() => {
    if (userData?.role === "admin" || userData?.blocked) {
      setShowWarning(false);
      setShowTimer(false);
      setTimeLeft(0);
      return;
    }

    if (priceToPay > threshold) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [priceToPay, userData?.blocked]);

  useEffect(() => {
    if (userData?.role === "admin" || userData?.blocked || priceToPay === 0) {
      setTimeLeft(0);
      return;
    }

    const createdAtTime = new Date(userData?.updatedAt).getTime();
    const currentTime = new Date().getTime();
    const elapsedTime = (currentTime - createdAtTime) / 1000; // Convert to seconds

    const totalAllowedTime = 432000; // 5 days in seconds
    let remainingTime = totalAllowedTime - elapsedTime;

    if (remainingTime < 0) remainingTime = 0;
    setTimeLeft(remainingTime);

    if (remainingTime <= 172800) {
      setShowTimer(true); // Show timer only if < 2 days left
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          alert("Your time is up! You are now blocked.");
          blockUser(userData._id);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [priceToPay, userData?.products]);

  // Function to format time in HH:MM:SS
  const formatTime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${days}d ${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const singleLevel = async () => {
    if (!userData?.level) return null;
    try {
      const response = await fetch(
        `${backendUrl}/api/level/singlelevel/${userData.level}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch level.");
      }

      const data = await response.json(); // ✅ Parse response as JSON
      setLevel(data.level.levelName);
    } catch (error) {
      console.error("Error fetching level data:", error);
      toast.error("Failed to fetch user level. Please login again.");
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setToken("");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    if (userData) {
      singleLevel();
    }
  }, [userData]); 

  return (
    <>
      <div className="flex sticky top-0 z-50 bg-white items-center shadow-sm py-2 px-[4%] justify-between border-b">
        <div className="flex items-center gap-2">
          <img
            className="w-12"
            src={assets.logo}
            draggable={false}
            alt="Logo"
          />
        </div>
        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-700">
            Welcome, {firstName}
          </h1>
          <h2 className="flex justify-center text-sm text-gray-500">
            {userData?.role === "admin" ? "Admin" : "Seller"} {" "}
            {userData?.role === "admin" && (
              <p>{userData?.level ? level : "No Level Assigned"}</p>
            )}
          </h2>
          {userData?.role === "admin" && (
            <h2 className="flex gap-2 text-sm text-gray-500">
            <p>PP: {formatNumber(userData?.cc)}</p>
            <p>Left: {formatNumber(userData?.left)}</p>
            <p>Right: {formatNumber(userData?.right)}</p>
          </h2>
          
          )}
        </div>

        <button
          onClick={() => setToken("")}
          className="px-5 py-2 text-xs text-white bg-gray-600 rounded-full sm:px-7 sm:py-2 sm:text-sm">
          Logout
        </button>
      </div>

      {userData?.role !== "admin" && showWarning && !userData?.blocked && (
        <div className="relative p-4 w-full sm:w-[80%] mx-auto mt-2 text-center bg-white border border-red-500 shadow-xl rounded-xl">
          <h1 className="text-lg text-red-500">
            You have to pay ₹{priceToPay} to the admin otherwise your account
            will be blocked.
          </h1>

          {showTimer && (
            <h2 className="mt-2 text-xl font-semibold text-gray-700">
              Time left:{" "}
              <span className="text-red-600">{formatTime(timeLeft)}</span>
            </h2>
          )}

          <button
            onClick={() => setShowWarning(false)}
            className="absolute text-red-500 -translate-y-1/2 top-1/2 right-4">
            ❌
          </button>
        </div>
      )}

      {userData?.role !== "admin" && userData?.blocked && (
        <p className="text-center text-red-500 border-b">
          You are blocked. Talk to the admin for unblocking.
        </p>
      )}
    </>
  );
};

export default Navbar;
