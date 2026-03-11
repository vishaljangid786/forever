import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useApi } from '@/hooks/useApi';
import { useAppTheme } from '@/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  uid: string;
}

export default function TeamScreen() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const api = useApi();
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  const fetchTeam = async () => {
    try {
      const response = await api.get('/api/user/getTeamMember');
      if (response.data.success) {
        setTeam(response.data.teamMembers || []);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTeam();
  };

  const renderMember = ({ item }: { item: TeamMember }) => (
    <View 
      className={`flex-row items-center p-4 mb-4 rounded-3xl ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`}
      style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}
    >
      <View className={`w-14 h-14 rounded-2xl items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <Text className={`text-xl font-black ${isDark ? 'text-white' : 'text-black'}`}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="ml-4 flex-1">
        <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-black'}`}>{item.name}</Text>
        <Text className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>ID: {item.uid}</Text>
      </View>
      <View className={`px-3 py-1 rounded-full ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
        <Text className="text-[10px] font-black text-green-600 uppercase">Active</Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
        <ActivityIndicator size="large" color={isDark ? "#fff" : "#000"} />
      </View>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#121212]' : 'bg-[#fafafa]'}`}>
      <View className="px-6 py-6 flex-row justify-between items-center">
        <Text className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
          Our Team<Text className="text-red-500">.</Text>
        </Text>
        <View className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
          <Text className="text-lg">👥</Text>
        </View>
      </View>
      
      <FlatList
        data={team}
        renderItem={renderMember}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? "#fff" : "#000"} />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-4xl mb-4">🤝</Text>
            <Text className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No team members yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
