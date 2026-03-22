import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApi } from '@/hooks/useApi';
import { useAppTheme } from '@/context/ThemeContext';

interface OrderItem {
  productId?: {
    _id: string;
    name: string;
    price: number;
    image: string[];
  };
  name: string;
  price: number;
  quantity: number;
  image: string[];
}

interface Order {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  amount: number;
  status: string;
  date: number;
  payment: boolean;
  address: any;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const api = useApi();
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/order/userorders');
      if (response.data.success) {
        setOrders(response.data.orders.reverse());
        // console.log(response.data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'text-green-500';
      case 'shipped': return 'text-blue-500';
      case 'processing': return 'text-orange-500';
      case 'cancelled': return 'text-red-500';
      default: return isDark ? 'text-gray-400' : 'text-gray-500';
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity 
      className={`mb-6 rounded-3xl overflow-hidden shadow-sm ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`}
      style={{ elevation: 2 }}
      onPress={() => console.log('Single Order Details:', JSON.stringify(item, null, 2))}
    >
      <View className={`px-5 py-4 flex-row justify-between items-center border-b ${isDark ? 'border-gray-800' : 'border-gray-50'}`}>
        <View>
          <Text className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Order ID
          </Text>
          <Text className={`text-sm font-black ${isDark ? 'text-white' : 'text-black'}`}>
            #{item._id.slice(-8).toUpperCase()}
          </Text>
        </View>
        <View className="items-end">
          <View className={`px-3 py-1 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <Text className={`text-[10px] font-black uppercase ${getStatusColor(item.status)}`}>
              {item.status}
            </Text>
          </View>
          {item.userId?.name && (
            <Text className={`text-[10px] mt-1 font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              For: {item.userId.name}
            </Text>
          )}
        </View>
      </View>
      
      <View className="p-5">
        {item.items.map((prod, index) => (
          <View key={index} className="flex-row items-center mb-4">
            <Image 
              source={{ uri: prod.productId?.image?.[0] || prod.image?.[0] || 'https://imgs.search.brave.com/v32MO73ybj4I0fNwlWUU6DmFm_UOsMXyRoOchwBNI7s/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wbGFj/ZWhvbGQubmV0L3By/b2R1Y3Quc3Zn' }} 
              className="w-16 h-16 rounded-2xl bg-gray-100"
            />
            <View className="flex-1 ml-4">
              <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-black'}`} numberOfLines={1}>
                {prod.productId?.name || prod.name}
              </Text>
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                ₹{prod.productId?.price || prod.price} × {prod.quantity}
              </Text>
            </View>
          </View>
        ))}

        {item.address && (
          <View className={`mb-4 p-3 rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <Text className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Shipping Address
            </Text>
            <Text className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {item.address.street}, {item.address.city}
            </Text>
          </View>
        )}

        <View className={`mt-2 pt-4 border-t flex-row justify-between items-end ${isDark ? 'border-gray-800' : 'border-gray-50'}`}>
          <View>
            <Text className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Date
            </Text>
            <Text className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
          <View className="items-end">
            <Text className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Total Amount
            </Text>
            <Text className={`text-xl font-black ${isDark ? 'text-white' : 'text-black'}`}>
              ₹{item.amount}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
      <View className="px-6 py-6">
        <Text className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-[#1a1a1a]'}`}>
          My Orders<Text className="text-red-500">.</Text>
        </Text>
      </View>
      
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDark ? "#fff" : "#000"} />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-4xl mb-4">📦</Text>
            <Text className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No orders yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Orders;