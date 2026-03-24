import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import axios from "axios";
import { backendUrl } from "@/constants/constants";
import { useAuth } from "./AuthContext";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number | string;
  oldPrice: number | string;
  image: string[];
  category: string;
  subCategory: string;
  bestseller?: boolean;
  sizes?: string[];
  color?: string[];
  cc?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
    location: string;
  };
  averageRating?: number;
};

type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  role?: string;
};

type OrderItem = {
  productId?: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
};

type Order = {
  _id: string;
  userId?: string;
  items: OrderItem[];
  amount: number;
  status: string;
  date: number;
  payment: boolean;
  paymentMethod?: string;
  address?: any;
};

type TeamMember = {
  _id: string;
  name: string;
  email: string;
  uid: string;
};

type CartItem = {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: string;
    sizes: string[];
    image: string[];
  };
  quantity: number;
  size: string;
  color: string;
};

type AuthContextType = {
  allUsers: User[];
  fetchAllUsers: () => Promise<User[] | null>;
  loading: boolean;
};

const AdminContext = createContext<AuthContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // fetch all users;
  const fetchAllUsers = async () => {
    if (!token) return null;

    setLoading(true); // 🔥 start loading

    try {
      const res = await axios.get(`${backendUrl}/api/user/fetchallusers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        const users = res.data.users || [];
        setAllUsers(users);
        return users;
      }
    } catch (error) {
      console.error("Error fetching all users data:", error);
    } finally {
      setLoading(false); // 🔥 stop loading (important)
    }

    return null;
  };

  return (
    <AdminContext.Provider
      value={{
        fetchAllUsers,
        allUsers,
        loading
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AdminProvider");
  }
  return ctx;
};
