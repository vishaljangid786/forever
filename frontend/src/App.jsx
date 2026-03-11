import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import PlaceOrder from "./pages/PlaceOrder";
import Orders from "./pages/Orders";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchBar from "./components/SearchBar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Verify from "./pages/Verify";
import MyProfile from "./components/MyProfile";
import TermsConditions from "./components/TermsConditions";
import CompanyPolicy from "./components/companyPolicy";
import Signup from "./pages/Signup";
import { ShopContext } from "./context/ShopContext";
import DeleteRequest from "./pages/DeleteRequest";
import ReferredUsers from "./components/RefferedUsers";
import LevelController from "./components/Levelcontroller";
import Team from "./components/Team";
import AddMember from "./pages/AddMember";
import Bills from "./components/Bills.jsx";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;

const App = () => {
  const { token, userData } = useContext(ShopContext);
  
  return (
    <>
      <ToastContainer autoClose={1000} position="bottom-right" />
      <Navbar />
      <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        <SearchBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/myprofile" element={<MyProfile />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/refferedUsers" element={<ReferredUsers />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/bills" element={<Bills userData={userData} />} />
          <Route path="/addmember" element={<AddMember userData={userData} />} />
          <Route path="*" element={<h1>Page not found</h1>} />
          <Route path="/delete" element={<DeleteRequest />} />
          <Route path="/terms&conditions" element={<TermsConditions />} />
          <Route path="/privacy-policy" element={<CompanyPolicy />} />
          <Route
            path="/levelIncome"
            element={<LevelController token={token} userData={userData} />}
          />
          <Route path="/team" element={<Team token={token} userData={userData} />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
};

export default App;
