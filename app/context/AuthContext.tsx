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
  token: string | null;
  loading: boolean;
  userData: any;
  products: Product[];
  productsMap: Record<string, Product>;
  orders: Order[];
  teamMembers: TeamMember[];
  cartItems: CartItem[];
  usersMap: Record<string, any>;
  dataLoading: boolean;

  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserData: (force?: boolean) => Promise<any>;
  updateUserData: (payload: any) => Promise<any>;
  fetchProducts: (force?: boolean) => Promise<Product[]>;
  getProductById: (id: string, force?: boolean) => Promise<Product | null>;
  fetchOrders: (force?: boolean) => Promise<Order[]>;
  fetchTeamMembers: (force?: boolean) => Promise<TeamMember[]>;
  fetchCartItems: (force?: boolean) => Promise<CartItem[]>;
  removeCartItem: (itemId: string) => Promise<boolean>;
  addToCart: (payload: any) => Promise<boolean>;
  refreshAllData: () => Promise<void>;

  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, Product>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});
  const [hasFetchedUser, setHasFetchedUser] = useState(false);
  const [hasFetchedProducts, setHasFetchedProducts] = useState(false);
  const [hasFetchedOrders, setHasFetchedOrders] = useState(false);
  const [hasFetchedTeam, setHasFetchedTeam] = useState(false);
  const [hasFetchedCart, setHasFetchedCart] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        let storedToken;
        if (Platform.OS === "web") {
          storedToken = localStorage.getItem("token");
        } else {
          storedToken = await SecureStore.getItemAsync("token");
        }
        if (storedToken) {
          setToken(storedToken);
        } else {
          setToken(null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (newToken: string) => {
    if (Platform.OS === "web") {
      localStorage.setItem("token", newToken);
    } else {
      await SecureStore.setItemAsync("token", newToken);
    }
    setToken(newToken);
  };

  const getAuthHeaders = useCallback(
    () => ({
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }),
    [token],
  );

  const fetchUserData = useCallback(
    async (force = false) => {
      if (!token) return null;
      if (!force && hasFetchedUser) return userData;
      try {
        const res = await axios.get(
          `${backendUrl}/api/user/fetchuserdata`,
          getAuthHeaders(),
        );
        if (res.data.success) {
          const user = res.data.user || res.data.userData || null;
          setUserData(user);
          setHasFetchedUser(true);
          return user;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
      return null;
    },
    [getAuthHeaders, hasFetchedUser, token, userData],
  );

  const updateUserData = useCallback(
    async (payload: any) => {
      if (!token) return null;
      const res = await axios.put(
        `${backendUrl}/api/user/updateprofile`,
        payload,
        getAuthHeaders(),
      );
      if (res.data.success) {
        const updated = res.data.updatedUser;
        setUserData(updated);
        return updated;
      }
      return null;
    },
    [getAuthHeaders, token],
  );

  const fetchProducts = useCallback(
    async (force = false) => {
      if (!token) return [];
      if (!force && hasFetchedProducts) return products;
      try {
        const res = await axios.get(
          `${backendUrl}/api/product/list`,
          getAuthHeaders(),
        );
        if (res.data.success) {
          const list: Product[] = res.data.products || [];
          setProducts(list);
          const map: Record<string, Product> = {};
          list.forEach((p) => {
            map[p._id] = p;
          });
          setProductsMap(map);
          setHasFetchedProducts(true);
          return list;
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
      return [];
    },
    [getAuthHeaders, hasFetchedProducts, products, token],
  );

  const getProductById = useCallback(
    async (id: string, force = false) => {
      if (!id || !token) return null;
      if (!force && productsMap[id]) return productsMap[id];
      try {
        const res = await axios.get(
          `${backendUrl}/api/product/single/${id}`,
          getAuthHeaders(),
        );
        if (res.data.success && res.data.product) {
          const product = res.data.product as Product;
          setProductsMap((prev) => ({ ...prev, [product._id]: product }));
          setProducts((prev) => {
            if (prev.some((p) => p._id === product._id)) {
              return prev.map((p) => (p._id === product._id ? product : p));
            }
            return [...prev, product];
          });
          return product;
        }
      } catch (error) {
        console.error("Error fetching product by id:", error);
      }
      return null;
    },
    [getAuthHeaders, productsMap, token],
  );

  const fetchTeamMembers = useCallback(
    async (force = false) => {
      if (!token) return [];
      if (!force && hasFetchedTeam) return teamMembers;
      try {
        const res = await axios.get(
          `${backendUrl}/api/user/getTeamMember`,
          getAuthHeaders(),
        );
        if (res.data.success) {
          const members = res.data.teamMembers || [];
          setTeamMembers(members);
          setHasFetchedTeam(true);
          return members;
        }
      } catch (error) {
        console.error("Error fetching team members:", error);
      }
      return [];
    },
    [getAuthHeaders, hasFetchedTeam, teamMembers, token],
  );

  const fetchOrders = useCallback(
    async (force = false) => {
      if (!token) return [];
      if (!force && hasFetchedOrders) return orders;
      try {
        const res = await axios.get(
          `${backendUrl}/api/order/userorders`,
          getAuthHeaders(),
        );
        if (res.data.success) {
          const list: Order[] = (res.data.orders || []).reverse();
          setOrders(list);
          setHasFetchedOrders(true);

          const allProductIds: string[] = [];
          const allUserIds: string[] = [];
          list.forEach((order: Order) => {
            if (order.userId) allUserIds.push(order.userId);
            order.items.forEach((item) => {
              if (item.productId) allProductIds.push(item.productId);
            });
          });

          const uniqueProductIds = [...new Set(allProductIds)];
          const uniqueUserIds = [...new Set(allUserIds)];

          if (uniqueProductIds.length) {
            try {
              const pRes = await axios.post(
                `${backendUrl}/api/product/fetchMultipleProducts`,
                { productIds: uniqueProductIds },
                getAuthHeaders(),
              );
              if (pRes.data?.products) {
                setProductsMap((prev) => {
                  const next = { ...prev };
                  pRes.data.products.forEach((p: Product) => {
                    next[p._id] = p;
                  });
                  return next;
                });
              }
            } catch (e) {
              console.log("Product fetch error", e);
            }
          }

          if (uniqueUserIds.length) {
            try {
              const uRes = await axios.post(
                `${backendUrl}/api/user/fetchMultipleUsers`,
                { userIds: uniqueUserIds },
                getAuthHeaders(),
              );
              if (uRes.data?.users) {
                const map: Record<string, any> = {};
                uRes.data.users.forEach((u: any) => {
                  map[u._id] = u;
                });
                setUsersMap(map);
              }
            } catch (e) {
              console.log("User fetch error", e);
            }
          }

          return list;
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
      return [];
    },
    [getAuthHeaders, hasFetchedOrders, orders, token],
  );

  const fetchCartItems = useCallback(
    async (force = false) => {
      if (!token) return [];
      if (!force && hasFetchedCart) return cartItems;
      try {
        const res = await axios.get(`${backendUrl}/api/cart/get`, getAuthHeaders());
        if (res.data.success) {
          const items = res.data.cart?.items || [];
          setCartItems(items);
          setHasFetchedCart(true);
          return items;
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
      return [];
    },
    [cartItems, getAuthHeaders, hasFetchedCart, token],
  );

  const removeCartItem = useCallback(
    async (itemId: string) => {
      try {
        const res = await axios.post(
          `${backendUrl}/api/cart/remove`,
          { productId: itemId },
          getAuthHeaders(),
        );
        if (res.data.success) {
          setCartItems(res.data.cart?.items || []);
          return true;
        }
      } catch (error) {
        console.error("Error removing cart item:", error);
      }
      return false;
    },
    [getAuthHeaders],
  );

  const addToCart = useCallback(
    async (payload: any) => {
      try {
        const res = await axios.post(
          `${backendUrl}/api/cart/add`,
          payload,
          getAuthHeaders(),
        );
        if (res.data.success || res.status === 201) {
          await fetchCartItems(true);
          return true;
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
      return false;
    },
    [fetchCartItems, getAuthHeaders],
  );

  const refreshAllData = useCallback(async () => {
    if (!token) return;
    setDataLoading(true);
    try {
      await Promise.all([
        fetchUserData(true),
        fetchProducts(true),
        fetchOrders(true),
        fetchTeamMembers(true),
        fetchCartItems(true),
      ]);
    } finally {
      setDataLoading(false);
    }
  }, [fetchCartItems, fetchOrders, fetchProducts, fetchTeamMembers, fetchUserData, token]);

  useEffect(() => {
    if (!token) {
      setUserData(null);
      setProducts([]);
      setProductsMap({});
      setOrders([]);
      setTeamMembers([]);
      setCartItems([]);
      setUsersMap({});
      setHasFetchedUser(false);
      setHasFetchedProducts(false);
      setHasFetchedOrders(false);
      setHasFetchedTeam(false);
      setHasFetchedCart(false);
      return;
    }

    const bootstrapData = async () => {
      setDataLoading(true);
      try {
        // Priority data first so profile/cart open instantly.
        await Promise.all([fetchUserData(), fetchCartItems()]);
        // Remaining data in background without forcing re-fetch.
        fetchProducts().catch(() => null);
        fetchOrders().catch(() => null);
        fetchTeamMembers().catch(() => null);
      } finally {
        setDataLoading(false);
      }
    };

    bootstrapData();
  }, [token, fetchCartItems, fetchOrders, fetchProducts, fetchTeamMembers, fetchUserData]);


  const logout = async () => {
    if (Platform.OS === "web") {
      localStorage.removeItem("token");
    } else {
      await SecureStore.deleteItemAsync("token");
    }
    setToken(null);
    setUserData(null);
    setProducts([]);
    setProductsMap({});
    setOrders([]);
    setTeamMembers([]);
    setCartItems([]);
    setUsersMap({});
    setHasFetchedUser(false);
    setHasFetchedProducts(false);
    setHasFetchedOrders(false);
    setHasFetchedTeam(false);
    setHasFetchedCart(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        loading,
        userData,
        products,
        productsMap,
        orders,
        teamMembers,
        cartItems,
        usersMap,
        dataLoading,
        login,
        logout,
        fetchUserData,
        updateUserData,
        fetchProducts,
        getProductById,
        fetchOrders,
        fetchTeamMembers,
        fetchCartItems,
        removeCartItem,
        addToCart,
        refreshAllData,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
