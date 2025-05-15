import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import Login from "./components/Login";
import AllUsers from "./pages/AllUsers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import User from "./components/User.jsx";
import Admin from "./components/Admin.jsx";
import ListProducts from "./components/ListProducts.jsx";
import SellerOrder from "./components/SellerOrder.jsx";
import AllItems from "./components/AllItems.jsx";
import BannerImages from "./components/BannerImages.jsx";
import LevelIncome from "./components/LevelIncome.jsx";
import Scanner from "./components/Scanner.jsx";
import Requests from "./components/Requests.jsx";
import Transactions from "./components/Transactions.jsx";
import SellerTransactions from "./components/SellerTransactions.jsx";
import DeleteRequest from "./pages/DeleteRequest.jsx";
import Team from "./components/Team.jsx";
import LevelController from "./components/LevelController.jsx";
import Loading from "./components/Loading.jsx";
import Bill from "./components/Bill.jsx";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = "₹";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
      setUserData(null);
    }
  }, [token]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          const response = await axios.get(
            `${backendUrl}/api/user/fetchuserdata`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.data.success) {
            setUserData(response.data.user);
          } else {
            toast.error(response.data.message);
            console.error("Failed to fetch user data:", response.data.message);
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error(
            "Error fetching user data:",
            error.response ? error.response.data.message : error.message
          );
          toast.error("Error fetching user data");
        }
      }
    };

    fetchUserData();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer autoClose={1000} />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} userData={userData} />
          <div className="flex">
            <Sidebar userData={userData} />
            <div className="flex-1 p-2">
              <Routes>
                {/* User Routes */}
                <Route
                  path="/seller/dashboard"
                  element={<User token={token} userData={userData} />}
                />
                <Route
                  path="/seller/transactions"
                  element={
                    <Transactions userId={userData?._id} userData={userData} />
                  }
                />

                <Route
                  path="/seller/add"
                  element={
                    userData ? (
                      <Add token={token} userData={userData} />
                    ) : (
                      <Loading />
                    )
                  }
                />
                <Route path="/seller/scanner" element={<Scanner userData={userData} />} />

                <Route
                  path="/seller/listproducts"
                  element={<ListProducts token={token} userData={userData} />}
                />
                <Route
                  path="/seller/sellerOrder"
                  element={<SellerOrder token={token} userData={userData} />}
                />
                <Route
                  path="/seller/bills"
                  element={<Bill token={token} userData={userData} />}
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={<Admin userData={userData} />}
                />
                <Route
                  path="/seller/sellertransactions"
                  element={
                    <SellerTransactions userId={userData?._id} userData={userData} />
                  }
                />
                <Route
                  path="/admin/add"
                  element={<Add token={token} userData={userData} />}
                />
                <Route path="/admin/list" element={<List />} />
                <Route
                  path="/admin/orders"
                  element={<Orders token={token} userData={userData} />}
                />
                <Route
                  path="/admin/delete"
                  element={<DeleteRequest token={token} userData={userData} />}
                />
                <Route
                  path="/admin/allusers"
                  element={<AllUsers token={token} userData={userData} />}
                />
                <Route
                  path="/admin/team"
                  element={<Team token={token} userData={userData} />}
                />
                <Route
                  path="/admin/levelincome"
                  element={
                    <LevelController token={token} userData={userData} />
                  }
                />
                <Route
                  path="/admin/allitems"
                  element={<AllItems token={token} userData={userData} />}
                />
                <Route
                  path="/admin/requests"
                  element={<Requests token={token} userData={userData} />}
                />

                <Route
                  path="/admin/banner"
                  element={<BannerImages token={token} userData={userData} />}
                />

                <Route
                  path="/admin/level"
                  element={<LevelIncome token={token} userData={userData} />}
                />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
