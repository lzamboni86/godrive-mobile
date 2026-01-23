import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Search, User, MessageCircle, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StudentTabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#10B981',
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
          headerTitle: 'GO DRIVE',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
          href: '/schedule'
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: 'SAC',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Config',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    {/* Telas que não devem aparecer como tabs */}
      <Tabs.Screen
        name="agenda"
        options={{
          href: null,
          headerShown: false,
          title: ''
        }}
      />
      <Tabs.Screen
        name="lessons"
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
        name="services"
        options={{
          href: null,
          headerShown: false,
          title: ''
        }}
      />
      <Tabs.Screen 
        name="schedule/instructor/[id]" 
        options={{ 
          href: null,
          headerShown: false,
          title: ''
        }} 
      />
      <Tabs.Screen 
        name="schedule/step-1/[id]" 
        options={{ 
          href: null,
          headerShown: false,
          title: ''
        }} 
      />
      <Tabs.Screen 
        name="schedule/step-2/[id]" 
        options={{ 
          href: null,
          headerShown: false,
          title: ''
        }} 
      />
      <Tabs.Screen 
        name="schedule/step-3/[id]" 
        options={{ 
          href: null,
          headerShown: false,
          title: ''
        }} 
      />
      <Tabs.Screen 
        name="schedule/success" 
        options={{ 
          href: null,
          headerShown: false,
          title: ''
        }} 
      />

      <Tabs.Screen 
        name="schedule/pending" 
        options={{ 
          href: null,
          headerShown: false,
          title: ''
        }} 
      />

      <Tabs.Screen 
        name="schedule/failure" 
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
        name="reviews/[lessonId]"
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
        name="schedule" 
        options={{ 
          href: null,
          headerShown: false,
          title: ''
        }} 
      />

      <Tabs.Screen 
        name="schedule/index" 
        options={{ 
          href: null,
          headerShown: false,
          title: ''
        }} 
      />
    </Tabs>
  );
}
