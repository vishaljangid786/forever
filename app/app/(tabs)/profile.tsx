import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const { logout: authLogout } = useAuth();
  const { theme, toggleTheme } = useAppTheme();
  const isDark = theme === "dark";
  const api = useApi();

  const [userData, setUserData] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // ✅ FETCH USER
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/user/fetchuserdata");
        if (res.data.success) {
          const user = res.data.user || res.data.userData;
          setUserData(user);
          setEditData(user); // 🔥 important
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // ✅ HANDLE CHANGE (normal fields)
  const handleChange = (key: string, value: string) => {
    setEditData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ✅ HANDLE ADDRESS CHANGE
  const handleAddressChange = (key: string, value: string) => {
    setEditData((prev: any) => ({
      ...prev,
      address: {
        ...prev.address,
        [key]: value,
      },
    }));
  };

  // ✅ SAVE PROFILE
  const handleSave = async () => {
    try {
      const res = await api.put("/api/user/updateprofile", editData);

      if (res.data.success) {
        Alert.alert("Success", "Profile updated");
        setUserData(res.data.updatedUser);
        setIsEditing(false);
      } else {
        Alert.alert("Error", res.data.message);
      }
    } catch (err: any) {
      console.log(err);
      Alert.alert("Error", err.response?.data?.message || "Update failed");
    }
  };

  const handleLogout = async () => {
    await authLogout();
    router.replace("/(auth)/login");
  };

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-[#0f0f0f]" : "bg-[#f5f5f5]"}`}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Header Heading="My Profile" HeadingIcon={"person-circle-outline"} />

        {/* PROFILE HEADER */}
        <View
          className={`items-center mt-6 mb-10 px-6${
            isDark ? "bg-gray-500" : "bg-white"
          } mx-4 rounded-xl p-6 `}
        >
          {/* Avatar Wrapper */}
          <View className="relative">
            {/* Outer Ring */}
            <View className="w-32 h-32 rounded-full items-center justify-center bg-red-500/20">
              {/* Inner Circle */}
              <View
                className={`w-28 h-28 rounded-full items-center justify-center shadow-xl ${
                  isDark ? "bg-[#1c1c1c]" : "bg-white"
                }`}
              >
                <Text className="text-4xl font-extrabold text-red-500">
                  {userData?.name?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </View>
            </View>

            {/* ✏️ Edit Button */}
            <TouchableOpacity
              className="absolute bottom-1 right-1 w-10 h-10 bg-red-500 rounded-full items-center justify-center border-2 border-white"
              onPress={() => setIsEditing(true)}
            >
              <Text className="text-white text-sm">✏️</Text>
            </TouchableOpacity>
          </View>

          {/* Name */}
          <Text
            className={`text-2xl font-extrabold mt-5 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            {userData?.name || "User Name"}
          </Text>

          {/* Email */}
          <Text
            className={`text-sm mt-1 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {userData?.email}
          </Text>

          {/* 🔥 Extra Info Row (NEW) */}
          <View className="flex-row mt-4 gap-6">
            {/* Phone */}
            <View className="items-center">
              <Text
                className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                Phone
              </Text>
              <Text
                className={`text-sm font-semibold ${isDark ? "text-white" : "text-black"}`}
              >
                {userData?.phone || "-"}
              </Text>
            </View>

            {/* Location */}
            <View className="items-center">
              <Text
                className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                Location
              </Text>
              <Text
                className={`text-sm font-semibold ${isDark ? "text-white" : "text-black"}`}
              >
                {userData?.location || "-"}
              </Text>
            </View>
          </View>
        </View>

        <View
          className={`mx-4 mb-6 p-5 rounded-3xl ${
            isDark ? "bg-[#1a1a1a]" : "bg-white"
          }`}
        >
          <View className="flex-row justify-between items-center">
            <Text
              className={`text-base font-semibold ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              Dark Mode
            </Text>

            <Switch value={isDark} onValueChange={toggleTheme} />
          </View>
        </View>

        {/* 🔥 MAIN CARD */}
        <View
          className={`mx-4 rounded-3xl p-5 shadow-md ${
            isDark ? "bg-[#1a1a1a]" : "bg-white"
          }`}
        >
          {/* BASIC INFO */}
          <Text
            className={`text-lg font-bold mb-4 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            Basic Info
          </Text>

          <Field
            label="Full Name"
            value={editData?.name}
            editable={isEditing}
            onChange={(v: any) => handleChange("name", v)}
            isDark={isDark}
          />

          <Field
            label="Phone Number"
            value={editData?.phone?.toString()}
            editable={isEditing}
            onChange={(v: any) => handleChange("phone", v)}
            isDark={isDark}
          />

          <Field
            label="Location"
            value={editData?.location}
            editable={isEditing}
            onChange={(v: any) => handleChange("location", v)}
            isDark={isDark}
          />

          {/* 🔥 ADDRESS */}
          <Text
            className={`text-lg font-bold mt-6 mb-3 ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            Address
          </Text>

          {["street", "city", "state", "country", "zipcode"].map((key) => (
            <Field
              key={key}
              label={key}
              value={editData?.address?.[key]}
              editable={isEditing}
              onChange={(v: any) => handleAddressChange(key, v)}
              isDark={isDark}
            />
          ))}
        </View>

        {/* 🔥 ACTION BUTTONS */}
        <View className="px-4 mt-6">
          <TouchableOpacity
            onPress={() => setIsEditing(!isEditing)}
            className={`py-4 rounded-2xl ${
              isEditing ? "bg-gray-400" : "bg-blue-500"
            }`}
          >
            <Text className="text-white text-center font-bold text-base">
              {isEditing ? "Cancel Editing" : "Edit Profile"}
            </Text>
          </TouchableOpacity>

          {isEditing && (
            <TouchableOpacity
              onPress={handleSave}
              className="mt-3 py-4 bg-green-500 rounded-2xl"
            >
              <Text className="text-white text-center font-bold text-base">
                Save Changes
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 🔥 SETTINGS CARD */}

        {/* 🔥 LOGOUT */}
        <View className="px-4 mt-6 my-10">
          <TouchableOpacity
            onPress={handleLogout}
            className="py-4 border border-red-500 rounded-2xl"
          >
            <Text className="text-red-500 text-center font-bold text-base">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 🔥 REUSABLE FIELD
const Field = ({ label, value, editable, onChange, isDark }: any) => (
  <View className="mb-4">
    <Text
      className={`text-xs mb-1 font-semibold ${
        isDark ? "text-gray-400" : "text-gray-500"
      }`}
    >
      {label.toUpperCase()}
    </Text>

    {editable ? (
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={`Enter ${label}`}
        placeholderTextColor={isDark ? "#666" : "#999"}
        className={`p-4 rounded-xl text-sm ${
          isDark
            ? "bg-[#2a2a2a] text-white border border-[#333]"
            : "bg-gray-100 text-black border border-gray-200"
        }`}
      />
    ) : (
      <View
        className={`p-4 rounded-xl flex-row items-center justify-between ${
          isDark
            ? "bg-[#2a2a2a]/60 border border-[#2f2f2f]"
            : "bg-gray-100/70 border border-gray-200"
        }`}
        style={{ opacity: 0.7 }} // 🔥 fade effect
      >
        <Text
          className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {value || "Not set"}
        </Text>

        {/* 🔒 Optional Lock Icon */}
        <Text className={`${isDark ? "text-gray-500" : "text-gray-400"}`}>
          🔒
        </Text>
      </View>
    )}
  </View>
);
