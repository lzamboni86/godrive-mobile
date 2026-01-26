import React from 'react';
import { Tabs } from 'expo-router';
import { Home, MessageSquare, Settings, User, MessageCircle } from 'lucide-react-native';
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
          title: 'Aprovar',
          headerShown: false,
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
          title: 'Config',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: 'SAC',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    {/* Telas que não devem aparecer como tabs */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
          headerShown: false,
          title: ''
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          href: null,
          headerShown: false,
          title: ''
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          href: null,
          headerShown: false,
          title: ''
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          href: null,
          headerShown: false,
          title: ''
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null,
          headerShown: false,
          title: ''
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          href: null,
          headerShown: false,
          title: ''
        }}
      />
      <Tabs.Screen
        name="chat/[lessonId]"
        options={{
          href: null,
          headerShown: false,
          title: ''
        }}
      />
      <Tabs.Screen
        name="chat/index"
        options={{
          href: null,
          headerShown: false,
          title: ''
        }}
      />
    </Tabs>
  );
}
