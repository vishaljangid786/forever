import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Login = () => {
  const { setToken, navigate } = useContext(ShopContext);
  const [showpassword, setShowPassword] = useState(false);
  const [uid, setUid] = useState(""); // Changed from email to uid for login
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); // Kept email for forgot password
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [timer, setTimer] = useState(0);

  const handleAuthSuccess = (data) => {
    if (data.success && data.token) {
      setToken(data.token);
      localStorage.setItem("token", data.token);
      toast.success("Login successful!");
      navigate("/");
    } else {
      toast.error(data.message || "Authentication failed");
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/user/admin`, {
        uid, // Changed from email to uid
        password,
      });
      handleAuthSuccess(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    if (!email) {
      toast.error("Please enter your email first");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/user/sendOtp`, {
        email,
      });
      if (response.data.success) {
        setOtpSent(true);
        toast.success("OTP sent!");
        setTimer(120);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Format timer to show MM:SS format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };

  const verifyOtp = async () => {
    if (!otp || !password) {
      toast.error("Please enter OTP and new password");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/user/verifyOtp`, {
        email,
        otp,
        newPassword: password,
      });
      if (response.data.success) {
        handleAuthSuccess(response.data);
        setOtpSent(false);
        setOtp("");
        setPassword("");
        setShow(false);
      } else {
        toast.error(response.data.message || "OTP verification failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const forgotpass = () => {
    setShow(!show);
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800 dark:text-gray-200">
      <div className="inline-flex items-center gap-2 mt-10 mb-2">
        <p className="text-3xl prata-regular">Login</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800 dark:bg-gray-200" />
      </div>

      {/* Changed from email to UID for login */}
      {!show && (
        <>
          <input
            onChange={(e) => {
              const value = e.target.value.toUpperCase();
              const filtered = value.replace(/[^A-Z0-9]/g, "");
              setUid(filtered);
            }}
          value={uid}
            type="text"
            className="w-full px-3 py-2 border border-gray-800 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="User ID"
            required
          />

          {!otpSent && (
            <div className="relative w-full">
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type={showpassword ? "text" : "password"}
                className="w-full px-3 py-2 pr-10 border border-gray-800 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showpassword)}
                className="absolute transform -translate-y-1/2 right-2 top-1/2">
                {showpassword ? (
                  <i className="fa-solid fa-eye-slash"></i>
                ) : (
                  <i className="fa-solid fa-eye"></i>
                )}
              </button>
            </div>
          )}
        </>
      )}
      {show && (
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="text"
          className="w-full px-3 py-2 border border-gray-800 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Enter Email for OTP"
        />
      )}

      {otpSent && (
        <div className="flex flex-col w-full gap-3">
          <input
            onChange={(e) => setOtp(e.target.value)}
            value={otp}
            type="text"
            className="w-full px-3 py-2 border border-gray-800 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Enter OTP"
            required
          />
          <div className="relative w-full">
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type={showpassword ? "text" : "password"}
              className="w-full px-3 py-2 pr-10 border border-gray-800 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Enter password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showpassword)}
              className="absolute transform -translate-y-1/2 right-2 top-1/2">
              {showpassword ? (
                <i className="fa-solid fa-eye-slash"></i>
              ) : (
                <i className="fa-solid fa-eye"></i>
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={verifyOtp}
            disabled={loading}
            className="px-8 py-2 font-light text-white bg-black dark:bg-primary-500 disabled:bg-gray-400 dark:disabled:bg-gray-600">
            {loading ? "Verifying..." : "Verify OTP & Set Password"}
          </button>
        </div>
      )}

      <div className="w-full flex justify-between text-sm mt-[-8px]">
        <p className="cursor-pointer text-gray-700 dark:text-gray-300" onClick={forgotpass}>
          Forgot password
        </p>
        {show && (
          <p className="text-gray-500 dark:text-gray-400 cursor-pointer">
            {timer > 0 ? (
              `Resend OTP in ${formatTime(timer)}s`
            ) : (
              <span onClick={sendOtp} className="text-gray-600 dark:text-gray-300 cursor-pointer">
                {loading ? "Sending..." : "Send OTP"}
              </span>
            )}
          </p>
        )}
        <p onClick={() => navigate("/signup")} className="cursor-pointer text-gray-700 dark:text-gray-300">
          Create account
        </p>
      </div>

      {!otpSent && (
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-2 mt-4 font-light text-white bg-black dark:bg-primary-500 disabled:bg-gray-400 dark:disabled:bg-gray-600">
          {loading ? "Please wait..." : "Sign In"}
        </button>
      )}
    </form>
  );
};

export default Login;
