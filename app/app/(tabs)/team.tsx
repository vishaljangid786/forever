import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useAppTheme } from '@/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import LoadingScreen from '@/components/LoadingScreen';
import { useAuth } from '@/context/AuthContext';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  uid: string;
}

export default function TeamScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { teamMembers, fetchTeamMembers } = useAuth();
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  const loadTeam = async (force = false) => {
    try {
      await fetchTeamMembers(force);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadTeam(true);
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
    return (<LoadingScreen />
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#121212]' : 'bg-[#fafafa]'}`}>
      <Header Heading='Our Team' HeadingIcon='people-outline' />
      
      <FlatList
        data={teamMembers}
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
