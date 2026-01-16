import React from 'react';
import { Tabs } from 'expo-router';
import { Home, MessageSquare, Settings, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePendingRequests } from '@/hooks/usePendingRequests';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const pendingCount = usePendingRequests();
  
  console.log('🔔 TabLayout - pendingCount:', pendingCount);
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1E3A8A',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingTop: 8,
          paddingBottom: 8 + insets.bottom,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          headerTitle: 'GoDrive Instrutor',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Solicitações',
          headerTitle: 'Solicitações de Aula',
          tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#EF4444',
            color: 'white',
            fontSize: 12,
            fontWeight: 'bold',
            minWidth: 20,
            height: 20,
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Configuração',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          href: null
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
