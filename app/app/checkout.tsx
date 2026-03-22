import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useApi } from "@/hooks/useApi";
import { useAppTheme } from "@/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";

export default function CheckoutScreen() {
  const { cart, total } = useLocalSearchParams();
  const cartItems = JSON.parse(cart as string);
  const router = useRouter();
  const api = useApi();
  const { theme } = useAppTheme();
  const isDark = theme === "dark";

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null); // ✅ NEW

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  // ✅ FETCH USER DATA
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/user/fetchuserdata");
        if (res.data.success) {
          const user = res.data.user || res.data.userData;

          setUserData(user); // ✅ IMPORTANT

          const [firstName, ...lastName] = (user.name || "").split(" ");

          setFormData({
            firstName: firstName || "",
            lastName: lastName.join(" "),
            email: user.email || "",
            street: user.address?.street || "",
            city: user.address?.city || "",
            state: user.address?.state || "",
            zipcode: user.address?.zipcode || "",
            country: user.location || "",
            phone: user.phone?.toString() || "",
          });
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ PLACE ORDER (FIXED)
  const placeOrder = async () => {
    try {
      if (!formData.street || !formData.city || !formData.phone) {
        Alert.alert("Error", "Please fill complete details");
        return;
      }

      if (!userData?._id) {
        Alert.alert("Error", "User not found");
        return;
      }

      // ✅ SAME AS WEB
      const orderItems = cartItems.map((item: any) => {
        const priceArray = String(item.productId.price || "")
          .split(",")
          .map((p) => Number(p.trim()));

        const sizeIndex = item.productId?.sizes
          ? item.productId.sizes.indexOf(item.size)
          : 0;

        const finalPrice = priceArray[sizeIndex] ?? priceArray[0] ?? 0;

        return {
          productId: item.productId._id,
          name: item.productId.name,
          price: finalPrice, // ✅ FIXED
          quantity: item.quantity,
          image: item.productId.image?.[0],
          size: item.size || "default",
          color: item.color,
        };
      });
      const finalAmount = orderItems.reduce(
        (sum: any, item: any) => sum + item.price * item.quantity,
        0,
      );
      const orderData = {
        userId: userData._id,

        // ✅ EXACT SAME LIKE WEB
        userDetails: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
        },
        address: {
          ...formData,
        },

        items: orderItems,

        amount: finalAmount,
      };

      console.log("ORDER DATA 👉", orderData); // 🔥 debug

      const res = await api.post("/api/order/place", orderData);

      if (res.data.success) {
        Alert.alert("Success", "Order placed successfully");
        router.replace("/(tabs)/orders");
      } else {
        Alert.alert("Error", res.data.message);
        console.log(res.data);
      }
    } catch (error: any) {
      console.log("ORDER ERROR 👉", error.response?.data || error);
      Alert.alert("Error", error.response?.data?.message || "Order failed");
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-[#121212]" : "bg-[#fafafa]"}`}
    >
      <Header Heading="Checkout" showClose />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* FORM */}
        <View className="mt-5">
          {[
            { key: "firstName", placeholder: "First Name" },
            { key: "lastName", placeholder: "Last Name" },
            { key: "email", placeholder: "Email", editable: false },
            { key: "phone", placeholder: "Phone" },
            { key: "street", placeholder: "Street Address" },
            { key: "city", placeholder: "City" },
            { key: "state", placeholder: "State" },
            { key: "zipcode", placeholder: "Zipcode" },
            { key: "country", placeholder: "Country" },
          ].map((field) => (
            <TextInput
              key={field.key}
              placeholder={field.placeholder}
              placeholderTextColor={isDark ? "#666" : "#999"}
              value={(formData as any)[field.key]}
              editable={field.editable !== false}
              onChangeText={(text) => handleChange(field.key, text)}
              className={`p-4 mb-4 rounded-xl ${
                isDark ? "bg-[#1e1e1e] text-white" : "bg-white text-black"
              }`}
            />
          ))}
        </View>

        {/* TOTAL */}
        <View
          className={`mt-6 p-5 rounded-2xl ${
            isDark ? "bg-[#1e1e1e]" : "bg-white"
          }`}
        >
          <Text
            className={`text-xs uppercase ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Total Amount
          </Text>

          <Text
            className={`text-2xl font-black mt-1 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            ₹{Number(total).toFixed(2)}
          </Text>

          <TouchableOpacity
            onPress={placeOrder}
            className="bg-red-500 mt-5 py-4 rounded-xl"
          >
            <Text className="text-white text-center font-bold">
              PLACE ORDER
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
