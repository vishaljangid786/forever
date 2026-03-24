import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/context/ThemeContext";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import { Image } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useAppTheme();
  const isDark = theme === "dark";
  const { orders, productsMap, fetchOrders, userData } = useAuth();

  const loadOrders = async (force = false) => {
    try {
      await fetchOrders(force);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders(true);
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
      {userData.role === "admin" && (
        <View>
          <Header Heading="All Orders" HeadingIcon="cart-outline" />

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
                <Ionicons name="cube-outline"  size={40} className="mb-3" color={isDark ? "#fafafa" : "#1212"}/>
                <Text
                  className={`text-lg ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  No orders yet.
                </Text>
              </View>
            }
          />
        </View>
      )}

       {userData.role === "user" && (
        <View>
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
                <Ionicons name="cube-outline"  size={40} className="mb-3" color={isDark ? "#fafafa" : "#1212"}/>
                <Text
                  className={`text-lg ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  No orders yet.
                </Text>
              </View>
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default Orders;
