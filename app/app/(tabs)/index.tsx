import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
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
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";

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
            <View className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded-lg">
              <Text className="text-[10px] text-white font-bold uppercase tracking-wider">
                Bestseller
              </Text>
            </View>
          )}
        </View>
        <View className="p-4">
          <Text
            className={`text-xs font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            numberOfLines={1}
          >
            {item.category}
          </Text>
          <Text
            className={`text-xs font-bold ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
            numberOfLines={1}
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
      <LoadingScreen />
    );
  }

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-[#121212]" : "bg-[#fafafa]"}`}
    >
      <Header
        showSearch
        showLogo
        showCart
        isSearchVisible={showSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchOpen={() => setShowSearch(true)}
        onSearchClose={() => {
          setShowSearch(false);
          setSearchQuery(""); // optional reset
        }}
      />

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
      <View className="my-10" />
    </SafeAreaView>
  );
};

export default Index;
