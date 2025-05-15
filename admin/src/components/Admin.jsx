import React, { useEffect } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import Add from "../pages/Add";
import ListProducts from "./ListProducts";
import SellerOrder from "./SellerOrder";

const Admin = ({ token }) => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/admin/allitems"); // Redirect to /user/add on mount
  }, [navigate]);

  if (!token) return <Navigate to="/" />; // Redirect if token is missing

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">User Dashboard</h1>
      <Routes>
        <Route
          path="/admin/listproducts"
          element={<ListProducts token={token} />}
        />
        <Route
          path="/admin/sellerOrder"
          element={<SellerOrder token={token} />}
        />
      </Routes>
    </div>
  );
};

export default Admin;
