import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useApi } from "@/hooks/useApi";
import { useAppTheme } from "@/context/ThemeContext";
import { assets } from "@/assets/images/assets";
import { TextInput } from "react-native";
import { useRef } from "react";
import { Ionicons } from "@expo/vector-icons";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  oldPrice: number;
  image: string[];
  category: string;
  subCategory: string;
  bestseller: boolean;
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<TextInput>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const api = useApi();
  const router = useRouter();
  const { theme } = useAppTheme();
  const isDark = theme === "dark";

  const fetchProducts = async () => {
    try {
      const response = await api.get("/api/product/list");
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const renderProduct = ({ item }: { item: Product }) => {
    return (
      <TouchableOpacity
        className={`flex-1 m-2 rounded-2xl overflow-hidden shadow-lg ${
          isDark ? "bg-[#1e1e1e]" : "bg-white"
        }`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 5,
        }}
        onPress={() =>
          router.push({ pathname: "/product/[id]", params: { id: item._id } })
        }
      >
        <View className="relative">
          <Image
            source={{
              uri: item.image?.[0] || "https://via.placeholder.com/150",
            }}
            className="w-full h-[200px]"
            resizeMode="cover"
          />
          {item.bestseller && (
            <View className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded-md">
              <Text className="text-[10px] text-white font-bold uppercase tracking-wider">
                Bestseller
              </Text>
            </View>
          )}
        </View>
        <View className="p-4">
          <Text
            className={`text-sm font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            numberOfLines={1}
          >
            {item.category}
          </Text>
          <Text
            className={`text-base font-bold mb-2 h-10 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <View className="flex-row items-center justify-between mt-auto">
            <View className="flex-row items-center">
              <Text
                className={`text-lg font-black ${isDark ? "text-white" : "text-black"}`}
              >
                ₹{String(item.price).split(",")[0]}
              </Text>
              {item.oldPrice > item.price && (
                <Text className="text-xs text-gray-400 line-through ml-2">
                  ₹{String(item.oldPrice).split(",")[0]}
                </Text>
              )}
            </View>
            <View
              className={`w-8 h-8 rounded-full items-center justify-center ${isDark ? "bg-white" : "bg-black"}`}
            >
              <Ionicons name="add" size={20} color={isDark ? "#000" : "#fff"} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View
        className={`flex-1 justify-center items-center ${isDark ? "bg-[#121212]" : "bg-white"}`}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? "#ffffff" : "#000000"}
        />
      </View>
    );
  }

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-[#121212]" : "bg-[#fafafa]"}`}
    >
      {/* Header */}
      <View
        className={`flex-row justify-between items-center px-6 py-4 ${
          isDark ? "bg-[#121212]" : "bg-[#fafafa]"
        }`}
      >
        {/* Header left */}
        <View className={"flex-row items-center justify-center"}>
          <Text
            className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-gray-500" : "text-gray-400"}`}
          >
            Welcome to
          </Text>
          <Image
            source={isDark ? assets.logo : assets.logodark}
            resizeMode={"cover"}
            className={"size-10"}
          />
        </View>

        {/* Search & cart */}
        <View className="flex-row items-center space-x-3">
          <TouchableOpacity
            onPress={() => {
              setShowSearch(true);
              setTimeout(() => searchRef.current?.focus(), 100);
            }}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              isDark ? "bg-[#1e1e1e]" : "bg-white"
            }`}
          >
            <Ionicons
              name="search-outline"
              size={22}
              color={isDark ? "#fff" : "#000"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/modal")}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              isDark ? "bg-[#1e1e1e]" : "bg-white"
            }`}
          >
            <Ionicons
              name="cart-outline"
              size={22}
              color={isDark ? "#fff" : "#000"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* show Search input */}
      {showSearch && (
        <View className="px-6 mb-4">
          <View
            className={`flex-row items-center px-4 py-3 rounded-2xl ${
              isDark ? "bg-[#1e1e1e]" : "bg-white"
            }`}
          >
            <TextInput
              ref={searchRef}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search products..."
              placeholderTextColor={isDark ? "#888" : "#999"}
              className={`flex-1 text-base ${
                isDark ? "text-white" : "text-black"
              }`}
            />

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => {
                setShowSearch(false);
                setSearchQuery("");
              }}
            >
              <Ionicons
                name="close-outline"
                size={22}
                color={isDark ? "#fff" : "#000"}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Product List */}
      <FlatList
        data={showSearch ? filteredProducts : products}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={{ padding: 12 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? "#fff" : "#000"}
          />
        }
        ListHeaderComponent={
          <View className="mb-6 px-2">
            <View
              className={`rounded-3xl p-6 overflow-hidden relative ${isDark ? "bg-[#1e1e1e]" : "bg-black"}`}
            >
              <Text className="text-white text-3xl font-black mb-2">
                New Season
              </Text>
              <Text className="text-gray-400 text-sm mb-4">
                Discover the latest trends in fashion and accessories.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowSearch(true);
                  setTimeout(() => {
                    searchRef.current?.focus();
                  }, 100);
                }}
                className="bg-white px-6 py-3 rounded-full self-start"
              >
                <Text className="text-black font-bold">Shop Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            <Text
              className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              No products found
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Index;
