import { View, Text, ScrollView, Modal, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { useAdmin } from "@/context/AdminContext";
import { Ionicons } from "@expo/vector-icons";
import LoadingScreen from "@/components/LoadingScreen";

export default function AdminDashboard() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const isDark = theme === "dark";
  const [selectedUser, setSelectedUser] = React.useState<any>(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [filter, setFilter] = React.useState("all");

  const { allUsers, fetchAllUsers, loading } = useAdmin();
  useEffect(() => {
    fetchAllUsers();
  }, []);

  const stats = allUsers.reduce(
    (acc: any, user: any) => {
      acc.total++;

      if (user.role === "admin") acc.admin++;
      else if (user.role === "seller") acc.seller++;
      else acc.user++;

      return acc;
    },
    { total: 0, admin: 0, seller: 0, user: 0 },
  );

  const openUser = (user: any) => {
    setSelectedUser(user);
    setModalVisible(true);
  };
  const filteredUsers = allUsers?.filter((user: any) => {
    if (filter === "all") return true;
    return user.role === filter;
  });

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-[#0f0f0f]" : "bg-[#f5f5f5]"}`}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Header admin HeadingIcon={"person-circle"} toggle />

        {/* dashboard */}
        <View className="m-4">
          <Text className="text-gray-500 dark:text-gray-400 text-base mb-4">
            Dashboard
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {/* Total Users */}
            <View className="w-[48%] bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl mb-4 shadow flex-row justify-between items-center">
              <View>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  Total Users
                </Text>
                <Text className="text-2xl font-bold text-black dark:text-white mt-1">
                  {stats.total}
                </Text>
              </View>
              <Ionicons name="people" size={28} color="#6366f1" />
            </View>

            {/* Admins */}
            <View className="w-[48%] bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl mb-4 shadow flex-row justify-between items-center">
              <View>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  Total Admins
                </Text>
                <Text className="text-2xl font-bold text-black dark:text-white mt-1">
                  {stats.admin}
                </Text>
              </View>
              <Ionicons name="person-circle" size={28} color="#6366f1" />
            </View>

            {/* Sellers */}
            <View className="w-[48%] bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl mb-4 shadow flex-row justify-between items-center">
              <View>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  Total Seller
                </Text>
                <Text className="text-2xl font-bold text-black dark:text-white mt-1">
                  {stats.seller}
                </Text>
              </View>
              <Ionicons name="people" size={28} color="#6366f1" />
            </View>

            {/* Normal Users */}
            <View className="w-[48%] bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl mb-4 shadow flex-row justify-between items-center">
              <View>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  Total Users
                </Text>
                <Text className="text-2xl font-bold text-black dark:text-white mt-1">
                  {stats.total}
                </Text>
              </View>
              <Ionicons name="people-outline" size={28} color="#6366f1" />
            </View>
          </View>
        </View>
        <View className="w-[90%] mx-auto h-[1px] bg-slate-200 dark:bg-zinc-900 rounded-3xl" />

        <View className="m-4">
          <Text className="text-gray-500 dark:text-gray-400 text-base mb-3">
            All Users
          </Text>
          <View className="flex-row gap-2 mb-5">
            {["all", "admin", "seller", "user"].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setFilter(item)}
                className={`px-3 py-1 rounded-full ${
                  filter === item
                    ? "bg-indigo-500"
                    : "bg-gray-200 dark:bg-[#2a2a2a]"
                }`}
              >
                <Text
                  className={`text-sm capitalize ${
                    filter === item
                      ? "text-white"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden">
            {filteredUsers.map((user: any, index: number) => (
              <TouchableOpacity
                onPress={() => openUser(user)}
                key={user._id}
                className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#2a2a2a]"
              >
                {/* Left */}
                <View className="flex-row items-center gap-3">
                  <Text className="text-gray-400 w-6">{index + 1}</Text>

                  <View>
                    <Text className="text-black dark:text-white font-semibold">
                      {user.name}
                    </Text>
                    <Text className="text-gray-500 text-xs">{user.email}</Text>
                  </View>
                </View>

                {/* Right Arrow */}
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isDark ? "#aaa" : "#555"}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 mt-20 justify-end bg-black/50">
          <View
            className={`p-5 rounded-t-3xl ${
              isDark ? "bg-[#121212]" : "bg-white"
            }`}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-5">
              <Text
                className={`text-xl font-bold ${
                  isDark ? "text-white" : "text-black"
                }`}
              >
                User Details
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons
                  name="close"
                  size={26}
                  color={isDark ? "#fff" : "#000"}
                />
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* 👤 Basic Info Card */}
                <View
                  className={`p-4 rounded-2xl mb-4 ${
                    isDark ? "bg-[#1e1e1e]" : "bg-gray-100"
                  }`}
                >
                  <Text className="text-sm text-gray-400 mb-2">Basic Info</Text>

                  <Text className={`${isDark ? "text-white" : "text-black"}`}>
                    👤 {selectedUser.name}
                  </Text>
                  <Text className={`${isDark ? "text-white" : "text-black"}`}>
                    📧 {selectedUser.email}
                  </Text>
                  <Text className={`${isDark ? "text-white" : "text-black"}`}>
                    📱 {selectedUser.phone || "N/A"}
                  </Text>
                </View>

                {/* 🏷 Role Info */}
                <View
                  className={`p-4 rounded-2xl mb-4 ${
                    isDark ? "bg-[#1e1e1e]" : "bg-gray-100"
                  }`}
                >
                  <Text className="text-sm text-gray-400 mb-2">
                    Account Info
                  </Text>

                  <Text className={`${isDark ? "text-white" : "text-black"}`}>
                    🏷 Role: {selectedUser.role}
                  </Text>
                  <Text className={`${isDark ? "text-white" : "text-black"}`}>
                    🆔 UID: {selectedUser.uid}
                  </Text>
                  <Text className={`${isDark ? "text-white" : "text-black"}`}>
                    🔗 Referral: {selectedUser.referralCode}
                  </Text>
                </View>

                {/* 📍 Address */}
                <View
                  className={`p-4 rounded-2xl mb-4 ${
                    isDark ? "bg-[#1e1e1e]" : "bg-gray-100"
                  }`}
                >
                  <Text className="text-sm text-gray-400 mb-2">Address</Text>

                  <Text className={`${isDark ? "text-white" : "text-black"}`}>
                    📍 {selectedUser.address?.street}
                  </Text>
                  <Text className={`${isDark ? "text-white" : "text-black"}`}>
                    {selectedUser.address?.city}, {selectedUser.address?.state}
                  </Text>
                  <Text className={`${isDark ? "text-white" : "text-black"}`}>
                    {selectedUser.address?.country} -{" "}
                    {selectedUser.address?.zipcode}
                  </Text>
                </View>

                {/* 💰 Wallet / Stats */}
                <View
                  className={`p-4 rounded-2xl mb-4 ${
                    isDark ? "bg-[#1e1e1e]" : "bg-gray-100"
                  }`}
                >
                  <Text className="text-sm text-gray-400 mb-2">Financial</Text>

                  <Text className={`${isDark ? "text-white" : "text-black"}`}>
                    💰 Amount: ₹{selectedUser.amount}
                  </Text>
                  <Text className={`${isDark ? "text-white" : "text-black"}`}>
                    🪙 CC: {selectedUser.cc}
                  </Text>
                </View>

                {/* 🛒 Activity */}
                <View
                  className={`p-4 rounded-2xl mb-4 ${
                    isDark ? "bg-[#1e1e1e]" : "bg-gray-100"
                  }`}
                >
                  <Text className="text-sm text-gray-400 mb-2">Activity</Text>

                  <Text className={`${isDark ? "text-white" : "text-black"}`}>
                    🛒 Orders: {selectedUser.orders?.length}
                  </Text>
                  <Text className={`${isDark ? "text-white" : "text-black"}`}>
                    📦 Products: {selectedUser.products?.length}
                  </Text>
                  <Text className={`${isDark ? "text-white" : "text-black"}`}>
                    📈 Sales: {selectedUser.selled?.length}
                  </Text>
                </View>

                {/* ⚡ Status */}
                <View
                  className={`p-4 rounded-2xl mb-4 ${
                    isDark ? "bg-[#1e1e1e]" : "bg-gray-100"
                  }`}
                >
                  <Text className="text-sm text-gray-400 mb-2">Status</Text>

                  <Text
                    className={`font-bold ${
                      selectedUser.blocked ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {selectedUser.blocked ? "Blocked ❌" : "Active ✅"}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
