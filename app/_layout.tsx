import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { View, ActivityIndicator, LogBox } from 'react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { registerForPushNotificationsAsync } from '@/services/push';

import '../global.css';

LogBox.ignoreLogs(['expo-notifications', 'Android Push Notifications']);

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, isLoading, isInstructor, isAdmin } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const { token } = useAuth();

  useEffect(() => {
    const run = async () => {
      if (!isAuthenticated || !isInstructor || !token) return;
      const pushToken = await registerForPushNotificationsAsync();
      if (!pushToken) return;
      try {
        await api.post('/users/me/push-token', { token: pushToken });
      } catch {
        // ignore
      }
    };

    run();
  }, [isAuthenticated, isInstructor, token]);

  useEffect(() => {
    console.log('🔐 Auth State:', { isAuthenticated, isLoading, isInstructor, isAdmin, segments: segments[0] });
    
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inStudentGroup = segments[0] === '(student)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inAdminGroup = segments[0] === '(admin)';

    console.log('🔐 Navigation check:', { inAuthGroup, inStudentGroup, inTabsGroup, inAdminGroup });

    if (!isAuthenticated && !inAuthGroup) {
      console.log('🔐 Redirecting to login (not authenticated)');
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      if (isAdmin) {
        console.log('🔐 Redirecting ADMIN to admin area');
        router.replace('/(admin)' as any);
      } else if (isInstructor) {
        console.log('🔐 Redirecting INSTRUCTOR to tabs');
        router.replace('/(tabs)');
      } else {
        console.log('🔐 Redirecting STUDENT to student area');
        router.replace('/(student)' as any);
      }
    } else if (isAuthenticated && !isAdmin && !isInstructor && inTabsGroup) {
      console.log('🔐 Redirecting STUDENT from tabs to student area');
      router.replace('/(student)' as any);
    } else if (isAuthenticated && !isInstructor && !isAdmin && inStudentGroup) {
      // Aluno está no lugar certo - não redirecionar
      console.log('🔐 STUDENT is in correct area');
    } else if (isAuthenticated && isAdmin && !inAdminGroup) {
      console.log('🔐 Redirecting ADMIN to admin area');
      router.replace('/(admin)' as any);
    } else if (isAuthenticated && isInstructor && !inTabsGroup) {
      console.log('🔐 Redirecting INSTRUCTOR to tabs');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, isInstructor, isAdmin]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(student)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="payment-success" />
        <Stack.Screen name="payment-failure" />
        <Stack.Screen name="payment-pending" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
