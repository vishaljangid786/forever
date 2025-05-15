import axios from "axios";
import React, { useState } from "react";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = ({ setToken }) => {
  const navigate = useNavigate(); // Use useNavigate for redirection
  const [uid, setUid] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showpassword, setShowPassword] = useState(false);

  const handleAuthSuccess = (data) => {
    setToken(data.token); // Store the token
    localStorage.setItem("token", data.token); // Save it for persistence
  };


  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/user/admin`, {
        uid,
        password,
      });
      handleAuthSuccess(response.data);
      
      // Redirect based on user role (only "admin" and "user" allowed)
      if (response.data.user.role === "admin") {
        navigate("/admin/add");
      } else if (response.data.user.role === "seller") {
        navigate("/seller/add");
      } else {
        toast.error("You are not authorized to access this page.");
        setToken("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
      setUid("");
      setPassword("");
    }
  };

  
  return (
    <div className="flex items-center justify-center w-full min-h-screen">
      <div className="max-w-md px-8 py-6 bg-white rounded-lg shadow-md">
        <h1 className="mb-4 text-2xl font-bold">Login</h1>
        <form onSubmit={onSubmitHandler}>
          <div className="mb-3 min-w-72">
            <input
              onChange={(e) => {
                // Ensure input only contains uppercase letters and numbers
                const value = e.target.value.toUpperCase();
                if (/^[A-Z0-9]*$/.test(value)) {
                  setUid(value);
                }
              }}
              value={uid}
              className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
              type="text"
              placeholder="Your Uid"
              required
              pattern="[A-Z0-9]*" // Regex for capital letters and numbers only
              title="Only uppercase letters and numbers are allowed"
            />
          </div>
          <div className="relative w-full">
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type={showpassword ? "text" : "password"}
              className="w-full px-3 py-2 pr-10 rounded-md"
              placeholder="Enter new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showpassword)}
              className="absolute transform -translate-y-1/2 right-2 top-1/2">
              {showpassword ? (
                <i className="text-gray-500 fa-solid fa-eye-slash"></i>
              ) : (
                <i className="text-gray-500 fa-solid fa-eye"></i>
              )}
            </button>
          </div>
          <button
            className="w-full px-4 py-2 mt-2 text-white bg-black rounded-md"
            type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
