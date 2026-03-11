import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { useAppTheme } from '@/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UserData {
  name: string;
  email: string;
  uid: string;
  location?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipcode?: string;
  };
  referralCode?: string;
  phone?: number;
  role?: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { logout: authLogout } = useAuth();
  const { theme, toggleTheme } = useAppTheme();
  const isDark = theme === 'dark';
  const api = useApi();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/api/user/fetchuserdata');
        if (response.data.success) {
          setUserData(response.data.user || response.data.userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await authLogout();
    router.replace('/(auth)/login');
  };

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
        <ActivityIndicator size="large" color={isDark ? "#fff" : "#000"} />
      </View>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#121212]' : 'bg-[#fafafa]'}`}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-6 py-6">
          <Text className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
            My Profile<Text className="text-red-500">.</Text>
          </Text>
        </View>

        <View className="items-center mb-8 px-6">
          <View className={`w-32 h-32 rounded-[40px] items-center justify-center shadow-xl ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
            <View className={`w-24 h-24 rounded-[30px] items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-black'}`}>
              <Text className="text-white text-4xl font-black">
                {userData?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <TouchableOpacity className={`absolute bottom-0 right-0 w-10 h-10 bg-red-500 rounded-full items-center justify-center border-4 ${isDark ? 'border-[#121212]' : 'border-[#fafafa]'}`}>
              <Text className="text-white text-xs rotate-90">✏️</Text>
            </TouchableOpacity>
          </View>
          <Text className={`text-2xl font-black mt-4 ${isDark ? 'text-white' : 'text-black'}`}>
            {userData?.name || 'User'}
          </Text>
          <Text className={`text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {userData?.email}
          </Text>
        </View>

        <View className="px-6">
          <View className={`rounded-[20px] overflow-hidden shadow-sm ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
            <ProfileItem icon="🆔" label="Account ID" value={userData?.uid?.slice(0, 12) + '...'} isDark={isDark} />
            <ProfileItem icon="📱" label="Phone" value={userData?.phone?.toString()} isDark={isDark} />
            <ProfileItem icon="🛡️" label="Role" value={userData?.role} isDark={isDark} />
            <ProfileItem icon="🎁" label="Referral" value={userData?.referralCode} isDark={isDark} isLast />
          </View>

          <View className={`mt-6 rounded-[32px] overflow-hidden shadow-sm ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
            <TouchableOpacity onPress={toggleTheme} className="p-5 flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className={`w-10 h-10 rounded-2xl items-center justify-center mr-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <Text className="text-lg">{isDark ? '🌙' : '☀️'}</Text>
                </View>
                <View>
                  <Text className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Appearance
                  </Text>
                  <Text className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                    Dark Mode
                  </Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: "#e5e7eb", true: "#ef4444" }}
                thumbColor="#fff"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            onPress={handleLogout}
            className={`mt-8 py-5 rounded-[24px] flex-row items-center justify-center border-2 ${isDark ? 'border-red-500/20 bg-red-500/5' : 'border-red-500/30 bg-red-500/30'}`}
          >
            <Text className="text-red-500 text-base font-black uppercase tracking-widest">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const ProfileItem = ({ icon, label, value, isDark, isLast }: { icon: string; label: string; value?: string; isDark: boolean, isLast?: boolean }) => (
  <View className={`p-5 flex-row items-center ${!isLast ? (isDark ? 'border-b border-gray-800' : 'border-b border-gray-200') : ''}`}>
    <View className={`w-10 h-10 rounded-2xl items-center justify-center mr-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <Text className="text-lg">{icon}</Text>
    </View>
    <View className="flex-1">
      <Text className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        {label}
      </Text>
      <Text className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>
        {value || 'Not set'}
      </Text>
    </View>
    <Text className={`${isDark ? 'text-gray-200' : 'text-gray-600'} `}>›</Text>
  </View>
);
