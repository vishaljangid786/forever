import { Tabs, Redirect } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/context/ThemeContext";

export default function TabLayout() {
    const { theme } = useAppTheme();
    const { token, loading } = useAuth();
    const insets = useSafeAreaInsets();

    if (loading) {
        return null;
    }

    if (!token) {
        return <Redirect href="/(auth)/login" />;
    }

    const isDark = theme === "dark";
    const activeColor = isDark ? "#fff" : "#111";
    const inactiveColor = isDark ? "#666" : "#999";

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarActiveTintColor: activeColor,
                tabBarInactiveTintColor: inactiveColor,
                tabBarShowLabel: true,
                tabBarStyle: {
                    position: "absolute",
                    left: 15,
                    right: 15,
                    bottom: insets.bottom + 10, // 👈 prevents going under nav buttons
                    height: 55,
                    borderRadius: 24,
                    backgroundColor: isDark ? "#121212" : "#ffffff",
                    elevation: 10,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -5 },
                    shadowOpacity: 0.15,
                    shadowRadius: 15,
                    marginHorizontal: 30,
                    borderWidth: isDark ? 1 : 0,
                    borderColor: isDark ? "#333" : "transparent",
                    paddingBottom: 10,
                    paddingTop: 0,
                },

                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "600",
                },
            }}
        >
            {/* Home */}
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "home" : "home-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />

            {/* Orders */}
            <Tabs.Screen
                name="orders"
                options={{
                    title: "Orders",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "cart" : "cart-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />

            {/* Team */}
            <Tabs.Screen
                name="team"
                options={{
                    title: "Team",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "people" : "people-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />

            {/* Profile */}
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "person" : "person-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}