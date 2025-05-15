import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import { backendUrl } from "../App";

const Sidebar = ({ userData }) => {
  const [totalMembers, setTotalMembers] = useState(0);
  const userId = userData?._id;

  useEffect(() => {
    if (!userId) return; // Prevent unnecessary fetch calls

    const fetchReferrals = async () => {
      try {
        const response = await fetch(
          `${backendUrl}/api/user/referrals/${userId}`
        );
        if (!response.ok) {
          console.error(`Error: ${response.status} - ${response.statusText}`);
          return;
        }
        const data = await response.json();
        setTotalMembers(data.count || 0);
      } catch (error) {
        console.error("Error fetching referrals:", error.message);
      }
    };

    fetchReferrals();
  }, [userId]);

  const adminLinks = [
    {
      title: "Add Item",
      link: "/admin/add",
      icon: <img className="w-5 h-5" src={assets.add_icon} alt="" />,
    },
    {
      title: "My Orders",
      link: "/seller/sellerorder",
      icon: <img className="w-5 h-5" src={assets.order_icon} alt="" />,
    },
    {
      title: "My Items",
      link: "/seller/listproducts",
      icon: <i className="fa-brands fa-product-hunt"></i>,
    },
    {
      title: "List All Items",
      link: "/admin/allitems",
      icon: <i className="fa-solid fa-list"></i>,
    },
    {
      title: "Orders",
      link: "/admin/orders",
      icon: <img className="w-5 h-5" src={assets.order_icon} alt="" />,
    },
    {
      title: "All Users",
      link: "/admin/allusers",
      icon: <i className="fa-solid fa-users"></i>,
    },
    {
      title: "Banner Images",
      link: "/admin/banner",
      icon: <i className="fa-solid fa-images"></i>,
    },
    {
      title: "Add Level's",
      link: "/admin/level",
      icon: <i className="fa-solid fa-turn-up"></i>,
    },
    {
      title: "Requests",
      link: "/admin/requests",
      icon: <i className="fa-solid fa-circle-exclamation"></i>,
    },
    {
      title: "Delete Request",
      link: "/admin/delete",
      icon: <i className="fa-solid fa-trash"></i>,
    },
    {
      title: "Team  Members",
      link: "/admin/team",
      icon: <i className="hidden fa-solid fa-user lg:block"></i>,
      number: totalMembers,
    },
    {
      title: "Level  Income",
      link: "/admin/levelincome",
      icon: <i className="fa-solid fa-money-bill"></i>,
    },
    {
      title: "Manage Bills",
      link: "/seller/bills",
      icon: <i className="fa-solid fa-money-bills"></i>,
    },
    {
      title: "User Transactions",
      link: "/seller/transactions",
      icon: <i className="fa-solid fa-money-bill-transfer"></i>,
    },
    {
      title: "Seller Transactions",
      link: "/seller/sellertransactions",
      icon: <i className="fa-solid fa-money-bill-transfer"></i>,
    },
  ];

  const sellerLinks = [
    {
      title: "Add Item",
      link: "/seller/add",
      icon: <img className="w-5 h-5" src={assets.add_icon} alt="" />,
    },
    {
      title: "Scanner",
      link: "/seller/scanner",
      icon: (
        <img
          className="w-5 h-5"
          src="https://imgs.search.brave.com/FcT7mqVSAMVGhY0dLsAUwxzeBMYLwSW5bqVcf1hEgeU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAzLzY3Lzg2LzYw/LzM2MF9GXzM2Nzg2/NjAyM19JNUJsWlZP/ZHlsYllvb3ZjMUsx/M2ViYVo3ZW01WFQ4/Zi5qcGc"
          alt=""
        />
      ),
    },
    {
      title: "List Items",
      link: "/seller/listproducts",
      icon: <i className="fa-solid fa-calendar-days"></i>,
    },
    {
      title: "Orders",
      link: "/seller/sellerorder",
      icon: <img className="w-5 h-5" src={assets.order_icon} alt="" />,
    },
    {
      title: "Manage Bills",
      link: "/seller/bills",
      icon: <i className="fa-solid fa-money-bills"></i>,
    },
  ];

  const links = userData?.role === "admin" ? adminLinks : sellerLinks;

  return (
    <div className="lg:w-[15%] w-fit min-h-screen sticky left-0 flex flex-col gap-4 border-r-2">
      <div className="flex flex-col gap-4 pt-6 pl-[10%] lg:text-[1vw] text-[15px]">
        {links.map((item, index) => (
          <NavLink
            key={index}
            className="flex items-center gap-3 px-3 py-2 border border-r-0 border-gray-300 rounded-l"
            to={item.link}>
            <p> {item.icon}</p>
            <p className="hidden lg:block">{item.title}</p>
            <p className="-ml-2">{item?.number}</p>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
