import React, { useEffect } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import Add from "../pages/Add";
import ListProducts from "./ListProducts";
import SellerOrder from "./SellerOrder";

const User = ({ token,userData }) => {
  const navigate = useNavigate();
if (userData?.role =='user') {
  useEffect(() => {
    navigate("/user/add"); // Redirect to /user/add on mount
  }, [navigate]); 
}

  if (!token) return <Navigate to="/" />; // Redirect if token is missing

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">User Dashboard</h1>
      <Routes>
        <Route path="/user/add" element={<Add token={token} />} />
        <Route
          path="/user/listproducts"
          element={<ListProducts token={token} />}
        />
        <Route
          path="/user/sellerOrder"
          element={<SellerOrder token={token} />}
        />
      </Routes>
    </div>
  );
};

export default User;
