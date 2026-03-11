import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useApi } from "@/hooks/useApi";
import { useAppTheme } from "@/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface CartItem {
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
}

export default function CartModal() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const api = useApi();
  const { theme } = useAppTheme();
  const isDark = theme === "dark";
  const router = useRouter();

  const fetchCart = async () => {
    try {
      const response = await api.get("/api/cart/get");
      if (response.data.success) {
        setCartItems(response.data.cart.items);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const removeItem = async (productId: string) => {
    try {
      const response = await api.post("/api/cart/remove", { productId });
      if (response.data.success) {
        setCartItems(response.data.cart.items);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to remove item");
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => {
    const priceArray = String(item.productId?.price || "")
      .split(",")
      .map((p) => Number(p.trim()));

    const sizeIndex = item.productId?.sizes
      ? item.productId.sizes.indexOf(item.size)
      : 0;

    const finalPrice = priceArray[sizeIndex] ?? priceArray[0] ?? 0;

    return sum + finalPrice * item.quantity;
  }, 0);

  const placeOrder = async () => {
    if (cartItems.length === 0) return;
    try {
      const response = await api.post("/api/order/place", {
        items: cartItems.map((item) => ({
          productId: item.productId._id,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        amount: totalAmount,
        address: { city: "Demo", street: "Demo Street" }, // Simplified for now
      });
      if (response.data.success) {
        Alert.alert("Success", "Order placed successfully!");
        router.replace("/(tabs)/orders");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to place order");
    }
  };

  if (loading) {
    return (
      <View
        className={`flex-1 justify-center items-center ${isDark ? "bg-[#121212]" : "bg-white"}`}
      >
        <ActivityIndicator size="large" color={isDark ? "#fff" : "#000"} />
      </View>
    );
  }

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-[#121212]" : "bg-[#fafafa]"}`}
    >
      <View className="px-6 py-6 flex-row justify-between items-center">
        <Text
          className={`text-3xl font-black tracking-tighter ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
        >
          My Cart<Text className="text-red-500">.</Text>
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? "bg-[#1e1e1e]" : "bg-white"}`}
        >
          <Text
            className={`text-xl font-bold ${isDark ? "text-white" : "text-black"}`}
          >
            <Ionicons
              name="close-outline"
              color={isDark ? "#fff" : "#000"}
              size={24}
            />
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View
            className={`flex-row items-center p-4 mb-4 rounded-3xl ${isDark ? "bg-[#1e1e1e]" : "bg-white"}`}
            style={{ elevation: 2 }}
          >
            <Image
              source={{
                uri:
                  item.productId?.image?.[0] ||
                  "https://via.placeholder.com/150",
              }}
              className="w-20 h-20 rounded-2xl bg-gray-100"
            />
            <View className="flex-1 ml-4">
              <Text
                className={`text-base font-bold ${isDark ? "text-white" : "text-black"}`}
                numberOfLines={1}
              >
                {item.productId?.name}
              </Text>
              <Text
                className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                {item.size} • {item.color}
              </Text>
              <View className="flex-row items-center justify-between mt-2">
                <Text
                  className={`text-sm font-black ${isDark ? "text-white" : "text-black"}`}
                >
                  {(() => {
                    const priceArray = String(
                      item.productId?.price || "",
                    ).split(",");
                    const sizeIndex = item.productId?.sizes
                      ? item.productId.sizes.indexOf(item.size)
                      : 0;

                    return `₹${Number(
                      priceArray[sizeIndex] ?? priceArray[0] ?? 0,
                    ).toLocaleString("en-IN")}`;
                  })()}
                </Text>
                <View
                  className={`px-2 py-1 rounded-lg ${isDark ? "bg-gray-800" : "bg-gray-50"}`}
                >
                  <Text
                    className={`text-xs font-bold ${isDark ? "text-white" : "text-black"}`}
                  >
                    qty: {item.quantity}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => removeItem(item._id)}
              className="ml-2 p-2"
            >
              <Ionicons
                name="trash-outline"
                color={isDark ? "#fff" : "#000"}
                className="text-2xl"
                size={22}
              />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-5xl mb-4">🛒</Text>
            <Text
              className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              Your cart is empty
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              className="mt-6 bg-black dark:bg-white px-8 py-3 rounded-full"
            >
              <Text className="text-white dark:text-black font-bold">
                Go Shopping
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {cartItems.length > 0 && (
        <View
          className={`absolute bottom-0 left-0 right-0 p-6 border-t ${isDark ? "bg-[#1e1e1e] border-gray-800" : "bg-white border-gray-100"}`}
        >
          <View className="flex-row justify-between items-center">
            <View>
              <Text
                className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                Total Amount
              </Text>
              <Text
                className={`text-2xl font-black ${isDark ? "text-white" : "text-black"}`}
              >
                ₹{totalAmount.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              className="bg-red-500 px-10 py-4 rounded-2xl shadow-lg shadow-red-500/30"
              onPress={placeOrder}
            >
              <Text className="text-white text-base font-black uppercase tracking-widest">
                Checkout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  containerDark: { backgroundColor: "#121212" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: { fontSize: 24, fontWeight: "bold" },
  closeBtn: { fontSize: 16, color: "#666" },
  cartItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  cardDark: { borderBottomColor: "#333" },
  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 15 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: "600" },
  itemMeta: { fontSize: 12, color: "#666", marginVertical: 4 },
  itemPrice: { fontSize: 14, fontWeight: "bold" },
  removeText: { color: "#ff4444", fontSize: 14 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: "#eee" },
  footerDark: { borderTopColor: "#333" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  totalLabel: { fontSize: 18, fontWeight: "600" },
  totalPrice: { fontSize: 20, fontWeight: "bold" },
  checkoutBtn: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  checkoutText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  textDark: { color: "#fff" },
  textDarkSecondary: { color: "#aaa" },
});
