import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApi } from "@/hooks/useApi";
import { useAppTheme } from "@/context/ThemeContext";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import { Image } from "react-native";
import { AuthProvider, useAuth } from "@/context/AuthContext";

interface OrderItem {
  productId?: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  amount: number;
  status: string;
  date: number;
  payment: boolean;
  paymentMethod?: string;
  address?: any;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [productsMap, setProductsMap] = useState<any>({});
  const [usersMap, setUsersMap] = useState<any>({});
  const api = useApi();
  const { theme } = useAppTheme();
  const isDark = theme === "dark";
  const { token } = useAuth();

  const fetchOrders = async () => {
    try {
      const response = await api.get("/api/order/userorders");

      if (response.data.success) {
        const ordersData = response.data.orders.reverse();
        setOrders(ordersData);

        // ✅ STEP 2: IDs extract yahi hoga
        const allProductIds: string[] = [];
        const allUserIds: string[] = [];

        ordersData.forEach((order: any) => {
          if (order.userId) allUserIds.push(order.userId);

          order.items.forEach((item: any) => {
            if (item.productId) {
              allProductIds.push(item.productId);
            }
          });
        });

        // duplicates remove
        const uniqueProductIds = [...new Set(allProductIds)];
        const uniqueUserIds = [...new Set(allUserIds)];

        // ✅ STEP 5: fetch call
        await fetchProducts(uniqueProductIds);
        await fetchUsers(uniqueUserIds);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchProducts = async (ids: string[]) => {
    try {
      const res = await api.post("/api/product/fetchMultipleProducts", {
        productIds: ids,
      },{
        headers:{Authorization:`Bearer ${token}`},
      });

      const map: any = {};
      res.data.products.forEach((p: any) => {
        map[p._id] = p;
      });

      setProductsMap(map);
    } catch (err) {
      console.log("Product fetch error", err);
    }
  };

  const fetchUsers = async (ids: string[]) => {
    try {
      const res = await api.post("/api/user/fetchMultipleUsers", {
        userIds: ids,
      });

      const map: any = {};
      res.data.users.forEach((u: any) => {
        map[u._id] = u;
      });

      setUsersMap(map);
    } catch (err) {
      console.log("User fetch error", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "border-green-500 bg-green-500/10 text-green-500";
      case "shipped":
        return "border-blue-500 bg-blue-500/10 text-blue-500";
      case "processing":
        return "border-orange-500 bg-orange-500/10 text-orange-500";
      case "cancelled":
        return "border-red-500 bg-red-500/10 text-red-500";
      default:
        return "border-gray-400 bg-gray-400/10 text-gray-500";
    }
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const totalItems = item.items.reduce((acc, i) => acc + i.quantity, 0);

    return (
      <TouchableOpacity
        className={`mb-5 rounded-3xl overflow-hidden ${
          isDark ? "bg-[#1e1e1e]" : "bg-white"
        }`}
        style={{ elevation: 2 }}
      >
        {/* HEADER */}
        <View
          className={`px-5 py-4 flex-row justify-between items-center border-b ${
            isDark ? "border-gray-800" : "border-gray-100"
          }`}
        >
          <View>
            <Text
              className={`text-[10px] font-bold uppercase ${
                isDark ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Order
            </Text>
            <Text
              className={`text-sm font-black ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              #{item._id.slice(-5)}
            </Text>
          </View>

          <View className="items-end">
            <View
              className={`px-3 py-1 rounded-full border ${getStatusStyle(
                item.status,
              )}`}
            >
              <Text className="text-[10px] font-bold uppercase">
                {item.status}
              </Text>
            </View>

            <Text
              className={`text-[10px] mt-1 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {totalItems} items • {item.paymentMethod}
            </Text>
          </View>
        </View>

        {/* ITEMS */}
        <View className="p-5">
          {item.items.map((prod: any, index) => {
            const product = productsMap[prod.productId];

            return (
              <View
                key={index}
                className={`flex-row items-center mb-3 p-3 rounded-2xl ${
                  isDark ? "bg-gray-800/40" : "bg-gray-50"
                }`}
              >
                {/* IMAGE */}
                {product?.image?.[0] ? (
                  <Image
                    source={{ uri: product.image[0] }}
                    className="w-14 h-14 rounded-xl"
                  />
                ) : (
                  <View className="w-14 h-14 bg-gray-300 justify-center items-center rounded-xl">
                    <Text>📦</Text>
                  </View>
                )}

                {/* INFO */}
                <View className="flex-1 ml-3">
                  <Text
                    numberOfLines={1}
                    className={`text-sm font-bold ${
                      isDark ? "text-white" : "text-black"
                    }`}
                  >
                    {product?.name || `${prod.size} Product`}
                  </Text>

                  <Text
                    className={`text-xs ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {prod.size} • {prod.color}
                  </Text>

                  <Text
                    className={`text-sm font-semibold ${
                      isDark ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    ₹{prod.price} × {prod.quantity}
                  </Text>
                </View>

                {/* TOTAL */}
                <Text
                  className={`text-sm font-bold ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  ₹{prod.price * prod.quantity}
                </Text>
              </View>
            );
          })}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-[#121212]" : "bg-[#fafafa]"}`}
    >
      <Header Heading="My Orders" HeadingIcon="cart-outline" />

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? "#fff" : "#000"}
          />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-4xl mb-4">📦</Text>
            <Text
              className={`text-lg ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No orders yet
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Orders;
