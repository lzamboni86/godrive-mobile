import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Users, Settings, CheckCircle, AlertTriangle, FileText, DollarSign } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isLoading, isAuthenticated, isAdmin, isInstructor } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/(auth)/login');
      return;
    }

    if (!isAdmin) {
      router.replace(isInstructor ? '/(tabs)' : ('/(student)' as any));
    }
  }, [isLoading, isAuthenticated, isAdmin, isInstructor, router]);

  if (isLoading) return null;
  if (!isAuthenticated || !isAdmin) return null;
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#DC2626',
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
          title: 'Dashboard',
          headerTitle: 'Painel Admin',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="instructors"
        options={{
          title: 'Instrutores',
          tabBarIcon: ({ color, size }) => <CheckCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: 'Alunos',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: 'Fin',
          tabBarIcon: ({ color, size }) => <DollarSign size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: 'Logs',
          tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Config',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
