import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useApi } from "@/hooks/useApi";
import { useAppTheme } from "@/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import LoadingScreen from "@/components/LoadingScreen";
import Header from "@/components/Header";

const { width } = Dimensions.get("window");

interface Product {
  _id: string;
  name: string;
  description: string;
  price: string;
  oldPrice: string;
  image: string[];
  category: string;
  subCategory: string;
  sizes: string[];
  color: string[];
  cc: string;
  bestseller: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    location: string;
  };
  averageRating: number;
}

const ProductDetails = () => {
  const params = useLocalSearchParams();
  const id = params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const api = useApi();
  const { theme } = useAppTheme();
  const isDark = theme === "dark";
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log("Fetching product with id:", id);
        if (!id) {
          console.error("No product ID found in params");
          setLoading(false);
          return;
        }
        const response = await api.get(`/api/product/single/${id}`);
        console.log("Product fetch response:", response.data);
        if (response.data.success) {
          const fetchedProduct = response.data.product;
          setProduct(fetchedProduct);

          if (fetchedProduct.image?.length > 0) {
            setMainImage(fetchedProduct.image[0]);
          }

          if (fetchedProduct.sizes?.length > 0) {
            setSelectedSize(fetchedProduct.sizes[0]); // 🔥 default select
          }
        } else {
          console.error("Failed to fetch product:", response.data.message);
        }
      } catch (error: any) {
        console.error("Error fetching product:", error);
        if (error.response) {
          console.error("Error response data:", error.response.data);
          console.error("Error response status:", error.response.status);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    if (!selectedSize || !selectedColor) {
      alert("Please select size and color");
      return;
    }
    if (!product) return;

    try {
      const response = await api.post("/api/cart/add", {
        productId: id,
        quantity: 1,
        size: selectedSize,
        color: selectedColor,
        price: priceArray[selectedIndex] || priceArray[0],
      });
      if (response.data.success || response.status === 201) {
        alert("Added to cart!");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart");
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const priceArray = product?.price ? String(product.price).split(",") : [];
  const oldPriceArray = product?.oldPrice
    ? String(product.oldPrice).split(",")
    : [];

  if (!product) {
    return (
      <View
        className={`flex-1 justify-center items-center ${isDark ? "bg-[#121212]" : "bg-white"}`}
      >
        <Text className={`${isDark ? "text-white" : "text-black"}`}>
          Product not found
        </Text>
      </View>
    );
  }
  const selectedIndex = product?.sizes
    ? product.sizes.indexOf(selectedSize)
    : 0;

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-[#121212]" : "bg-white"}`}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header showBack title={product.name} />
      <ScrollView>
        <Image
          source={{ uri: mainImage }}
          className="w-full"
          style={{ height: width * 1.2 }}
          resizeMode="cover"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="p-2.5"
        >
          {product.image.map((img, index) => (
            <TouchableOpacity key={index} onPress={() => setMainImage(img)}>
              <Image
                source={{ uri: img }}
                className={`w-[60px] h-[60px] rounded-lg mr-2.5 border ${
                  mainImage === img
                    ? "border-black border-2"
                    : "border-gray-300"
                }`}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="p-5">
          <Text
            className={`text-2xl font-bold mb-2.5 ${isDark ? "text-white" : "text-black"}`}
          >
            {product.name}
          </Text>

          <Text
            className={`${isDark ? "text-gray-400" : "text-gray-600"} mb-2`}
          >
            Sold by: {product?.createdBy?.name}
          </Text>
          <View className="flex-row items-center mb-[15px]">
            <Text className="text-[22px] font-bold text-black mr-2.5 dark:text-white">
              ₹{priceArray[selectedIndex] || priceArray[0]}
            </Text>
            {product.oldPrice > product.price && (
              <Text className="text-lg text-gray-400 line-through">
                ₹{oldPriceArray[selectedIndex]}
              </Text>
            )}
          </View>
          <View className="mb-5">
            <Text
              className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-black"}`}
            >
              Specifications
            </Text>

            <Text className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
              CC: {product.cc}
            </Text>
          </View>
          {product.sizes && product.sizes.length > 0 && (
            <View className="mb-5">
              <Text
                className={`text-[18px] font-semibold mb-2.5 ${isDark ? "text-white" : "text-black"}`}
              >
                Select Size
              </Text>

              <View className="flex-row flex-wrap">
                {product.sizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    className={`px-[15px] py-2 rounded-lg border mr-2.5 mb-2.5 ${
                      selectedSize === size
                        ? isDark
                          ? "border-gray-500 bg-white"
                          : "border-black bg-gray-100"
                        : isDark
                          ? "border-gray-700"
                          : "border-gray-300"
                    }`}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text
                      className={`text-sm ${
                        selectedSize === size
                          ? isDark
                            ? "text-black font-bold"
                            : "text-black font-bold"
                          : isDark
                            ? "text-white"
                            : "text-black"
                      }`}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {product.color && product.color.length > 0 && (
            <View className="mb-5">
              <Text
                className={`text-[18px] font-semibold mb-2.5 ${
                  isDark ? "text-white" : "text-black"
                }`}
              >
                Select Color
              </Text>

              <View className="flex-row flex-wrap">
                {product.color.map((color) => (
                  <TouchableOpacity
                    key={color}
                    className={`px-[15px] py-2 rounded-lg border mr-2.5 mb-2.5 ${
                      selectedColor === color
                        ? isDark
                          ? "border-gray-500 bg-white"
                          : "border-black bg-gray-100"
                        : isDark
                          ? "border-gray-700"
                          : "border-gray-300"
                    }`}
                    onPress={() => setSelectedColor(color)}
                  >
                    <Text
                      className={`text-sm ${
                        selectedColor === color
                          ? "text-black font-bold"
                          : isDark
                            ? "text-white"
                            : "text-black"
                      }`}
                    >
                      {color}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          <View className="flex-row items-center mb-3">
            <Text className="text-yellow-500 text-lg">⭐</Text>
            <Text className={`ml-1 ${isDark ? "text-white" : "text-black"}`}>
              {product.averageRating == 0 && (
                <Text>No Ratings Yet | Become first to Rate.</Text>
              )}
            </Text>
          </View>
          <View className="flex-row mb-2">
            <Text className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Category: {product.category}
            </Text>

            <Text
              className={` mx-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              •
            </Text>

            <Text className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
              SubCategory: {product.subCategory}
            </Text>
          </View>

          {product.bestseller && (
            <View className="bg-red-500 px-3 py-1 rounded-full self-start mb-3">
              <Text className="text-white text-xs font-bold">BESTSELLER</Text>
            </View>
          )}
          <Text
            className={`text-base leading-6 mb-5 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            {product.description}
          </Text>
        </View>
      </ScrollView>

      <View
        className={`p-5 border-t ${isDark ? "bg-[#1e1e1e] border-gray-800" : "bg-white border-gray-100"}`}
      >
        <TouchableOpacity
          className="bg-black py-[15px] rounded-xl items-center"
          onPress={addToCart}
        >
          <Text className="text-white text-[18px] font-bold">Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetails;
