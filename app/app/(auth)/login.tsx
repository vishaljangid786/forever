import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import { assets } from "@/assets/images/assets";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";
import { backendUrl } from "@/constants/constants";
import { BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import AppInput from "@/components/AppInput";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const { theme, toggleTheme } = useAppTheme();

  const [showPassword, setShowPassword] = useState(false);
  const [uid, setUid] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [timer, setTimer] = useState(0);

  const handleAuthSuccess = async (data: any) => {
    if (data.success && data.token) {
      await login(data.token);
      router.replace("/(tabs)");
    } else {
      Alert.alert("Error", data.message || "Authentication failed");
    }
  };

  const onSubmitHandler = async () => {
    if (!uid || !password) {
      Alert.alert("Error", "Enter UID and password");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/user/admin`, {
        uid,
        password,
      });
      handleAuthSuccess(response.data);
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    if (!email) {
      Alert.alert("Error", "Enter email first");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/user/sendOtp`, {
        email,
      });

      if (response.data.success) {
        setOtpSent(true);
        setTimer(120);
        Alert.alert("Success", "OTP sent!");
      }
    } catch {
      Alert.alert("Error", "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || !password) {
      Alert.alert("Error", "Enter OTP and new password");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/user/verifyOtp`, {
        email,
        otp,
        newPassword: password,
      });

      if (response.data.success) {
        handleAuthSuccess(response.data);
      }
    } catch {
      Alert.alert("Error", "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };

  const isDark = theme === "dark";

  return (
    <View className={`flex-1 ${isDark ? "bg-[#050A1B]" : "bg-white"}`}>
      {/* Toggle Button */}
      <TouchableOpacity
        onPress={toggleTheme}
        className={`absolute top-14 right-6 z-50 px-4 py-2 rounded-full border ${
          isDark
            ? "bg-white/10 border-white/20"
            : "bg-slate-100 border-slate-300"
        }`}
      >
        <Text
          className={`text-sm font-medium ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          {isDark ? "☀️ Light" : "🌙 Dark"}
        </Text>
      </TouchableOpacity>

      {/* Main Content */}
      <View className="flex-1 justify-center items-center px-6">
        {/* Logo */}
        <View className="w-32 h-32 rounded-full mb-16 p-[10px] items-center justify-center">
          <Image
            source={isDark ? assets.logo : assets.logodark}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>

        {/* Card */}
        <View
          className={`w-full rounded-2xl p-6 border ${
            isDark ? "bg-[#111827] border-white/10" : "bg-white border-slate-200"
          }`}
        >
          {/* Heading */}
          <View className="flex-row justify-center items-center gap-2 mb-6">
            <Text
              className={`text-3xl ${isDark ? "text-white" : "text-slate-900"}`}
            >
              Login
            </Text>
            <View
              className={`h-[1.5px] w-8 ${
                isDark ? "bg-gray-300" : "bg-gray-800"
              }`}
            />
          </View>

          {/* Inputs */}
          <AppInput
            value={uid}
            onChangeText={(text) =>
              setUid(text.toUpperCase().replace(/[^A-Z0-9]/g, ""))
            }
            placeholder="User ID"
            isDark={isDark}
          />

          <View className="mt-4" />

          <AppInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            isDark={isDark}
          />

          {/* Forgot */}
          <Pressable onPress={() => setShowForgot(true)} className="mt-4">
            <Text
              className={`text-right ${
                isDark ? "text-gray-300" : "text-[#050A1B]"
              }`}
            >
              Forgot Password?
            </Text>
          </Pressable>

          {/* Button */}
          <Pressable
            onPress={onSubmitHandler}
            className={`rounded-2xl py-4 mt-8 ${
              isDark ? "bg-white" : "bg-[#111827]"
            }`}
          >
            {loading ? (
              <ActivityIndicator color={isDark ? "black" : "white"} />
            ) : (
              <Text
                className={`text-center font-semibold text-lg ${
                  isDark ? "text-[#111827]" : "text-white"
                }`}
              >
                Sign In
              </Text>
            )}
          </Pressable>

          {/* Signup */}
          <View className="flex-row items-center mt-8 justify-center">
            <Text className={isDark ? "text-gray-300" : "text-slate-700"}>
              New User?
            </Text>

            <Pressable onPress={() => router.push("/(auth)/signup")}>
              <Text className="text-blue-600 underline ml-1">
                Create Account
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
