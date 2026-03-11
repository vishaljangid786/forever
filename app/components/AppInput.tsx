import { BlurView } from "expo-blur";
import React, { useState, ReactNode } from "react";
import { TextInput, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  isDark: boolean;
  rightElement?: ReactNode; // 👈 NEW PROP
}

export default function AppInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  isDark,
  rightElement,
}: Props) {
  const [isSecure, setIsSecure] = useState(!!secureTextEntry);

  return (
    <View className="overflow-hidden">
      <BlurView
        intensity={25}
        tint={isDark ? "dark" : "light"}
        className={`flex-row items-center px-4 py-3 ${
          isDark
            ? "bg-white/50 border border-white/20"
            : "bg-white/60 border border-black/40"
        }`}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? "#cbd5e1" : "#050A1B"}
          secureTextEntry={isSecure}
          className={`flex-1 text-lg ${
            isDark ? "text-white" : "text-[#050A1B]"
          }`}
          style={{ paddingVertical: 0 }}
        />

        {/* Password Toggle */}
        {secureTextEntry && (
          <Pressable
            onPress={() => setIsSecure(!isSecure)}
            hitSlop={10}
            className="ml-2"
          >
            <Ionicons
              name={isSecure ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={isDark ? "#e2e8f0" : "#050A1B"}
            />
          </Pressable>
        )}

        {/* Custom Right Element */}
        {rightElement && <View className="ml-2">{rightElement}</View>}
      </BlurView>
    </View>
  );
}