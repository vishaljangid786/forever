import React, { useEffect, useRef } from "react";
import { View, Animated, Easing } from "react-native";
import { useAppTheme } from "@/context/ThemeContext";

const Dot = ({ delay, color }: { delay: number; color: string }) => {
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 400,
          delay,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.5,
          duration: 400,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        width: 12,
        height: 12,
        borderRadius: 6,
        marginHorizontal: 6,
        backgroundColor: color,
        transform: [{ scale }],
      }}
    />
  );
};

const LoadingScreen = () => {
  const { theme } = useAppTheme();
  const isDark = theme === "dark";

  const dotColor = isDark ? "#ffffff" : "#000000";

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: isDark ? "#121212" : "#ffffff",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Dot delay={0} color={dotColor} />
        <Dot delay={150} color={dotColor} />
        <Dot delay={300} color={dotColor} />
      </View>
    </View>
  );
};

export default LoadingScreen;