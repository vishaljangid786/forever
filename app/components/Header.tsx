import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Image, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { assets } from "@/assets/images/assets";
import { useAppTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { Switch } from "react-native";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showClose?: boolean;

  showSearch?: boolean;
  showCart?: boolean;
  showLogo?: boolean;
  isSearchVisible?: boolean;
  Heading?: string;
  searchQuery?: string;
  HeadingIcon?: any;
  setSearchQuery?: (text: string) => void;
  onSearchOpen?: () => void;
  onSearchClose?: () => void;
  admin?: boolean;
  toggle?: boolean;
}

const Header = ({
  title,
  showBack = false,
  showClose = false,
  showSearch = false,
  showCart = false,
  showLogo = false,
  searchQuery = "",
  setSearchQuery,
  onSearchOpen,
  onSearchClose,
  isSearchVisible,
  HeadingIcon,
  Heading,
  admin = false,
  toggle = false,
}: HeaderProps) => {
  const router = useRouter();
  const { userData } = useAuth();
  const searchRef = useRef<TextInput>(null);

  const { theme, toggleTheme } = useAppTheme();
  const isDark = theme === "dark";

  return (
    <>
      {/* Top Header */}
      <View
        className={`flex-row justify-between items-center px-6 py-4 ${
          isDark ? "bg-[#121212]" : "bg-[#fafafa]"
        }`}
      >
        {/* Left Section */}
        <View className="flex-row items-center space-x-2">
          {Heading && (
            <View>
              <Text
                className={`text-3xl font-black tracking-tighter ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
              >
                {Heading}
                <Text className="text-red-500">.</Text>
              </Text>
            </View>
          )}

          {showBack && (
            <TouchableOpacity className="mr-2" onPress={() => router.back()}>
              <Ionicons
                name="arrow-back"
                size={22}
                color={isDark ? "#fff" : "#000"}
              />
            </TouchableOpacity>
          )}

          {showLogo && (
            <>
              <Text
                className={`text-xs font-bold uppercase tracking-widest ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Welcome to
              </Text>
              <Image
                source={isDark ? assets.logo : assets.logodark}
                className="size-10"
              />
            </>
          )}
          {admin && (
            <>
              <Image
                source={isDark ? assets.logo : assets.logodark}
                className="size-10"
              />
              <Text
                className={`text-xs font-bold uppercase tracking-widest ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Hello, {userData?.name?.split(" ")[0] || "User"}
              </Text>
            </>
          )}

          {title && (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className={`text-lg font-bold ${
                isDark ? "text-white" : "text-black"
              }`}
              style={{ maxWidth: 180 }}
            >
              {title}
            </Text>
          )}
        </View>

        {/* Right Section */}
        <View className="flex-row items-center space-x-3">
          {HeadingIcon && (
            <Ionicons
              name={HeadingIcon}
              size={26}
              color={isDark ? "#fff" : "#000"}
            />
          )}
          {toggle && (
            <View
              className={`rounded-3xl ${
                isDark ? "" : "bg-white"
              }`}
            >
                <Switch value={isDark} onValueChange={toggleTheme} />
            </View>
          )}
          {showSearch && (
            <TouchableOpacity
              onPress={() => {
                onSearchOpen?.();
                setTimeout(() => searchRef.current?.focus(), 100);
              }}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                isDark ? "bg-[#1e1e1e]" : "bg-white"
              }`}
            >
              <Ionicons
                name="search-outline"
                size={20}
                color={isDark ? "#fff" : "#000"}
              />
            </TouchableOpacity>
          )}

          {showCart && (
            <TouchableOpacity
              onPress={() => router.push("/modal")}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                isDark ? "bg-[#1e1e1e]" : "bg-white"
              }`}
            >
              <Ionicons
                name="cart-outline"
                size={20}
                color={isDark ? "#fff" : "#000"}
              />
            </TouchableOpacity>
          )}

          {showClose && (
            <TouchableOpacity onPress={() => router.back()}>
              <View
                style={{ borderRadius: 100 }}
                className={`rounded-full p-1 ${isDark ? "bg-zinc-800" : "bg-slate-100"}`}
              >
                <Ionicons
                  name="close-outline"
                  size={28}
                  color={isDark ? "#fff" : "#000"}
                />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Input */}
      {isSearchVisible && (
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
              placeholder="Search..."
              placeholderTextColor={isDark ? "#888" : "#999"}
              className={`flex-1 ${isDark ? "text-white" : "text-black"}`}
            />

            <TouchableOpacity onPress={onSearchClose}>
              <Ionicons
                name="close-outline"
                size={20}
                color={isDark ? "#fff" : "#000"}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};

export default Header;
