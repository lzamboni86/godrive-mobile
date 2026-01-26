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

console.log('🚀 [BOOT] Root layout module loaded');

try {
  // Evita que falhas do Keep Awake quebrem o carregamento do app.
  // (ex.: web / ambiente sem suporte)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const keepAwake = require('expo-keep-awake') as {
    activateKeepAwake?: () => void;
  };
  keepAwake.activateKeepAwake?.();
  console.log('🚀 [BOOT] KeepAwake.activateKeepAwake: OK');
} catch (error) {
  console.log('🚀 [BOOT] KeepAwake.activateKeepAwake: ERROR (ignored)', error);
}

void SplashScreen.preventAutoHideAsync()
  .then(() => {
    console.log('🚀 [BOOT] SplashScreen.preventAutoHideAsync: OK');
  })
  .catch((error) => {
    console.log('🚀 [BOOT] SplashScreen.preventAutoHideAsync: ERROR', error);
  });

function RootLayoutNav() {
  const { isAuthenticated, isLoading, isInstructor, isAdmin } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const { token } = useAuth();

  useEffect(() => {
    const run = async () => {
      console.log('🚀 [BOOT] Push registration effect start');
      try {
        if (!isAuthenticated || !isInstructor || !token) return;

        const pushToken = await registerForPushNotificationsAsync();
        if (!pushToken) return;

        try {
          await api.post('/users/me/push-token', { token: pushToken });
          console.log('🚀 [BOOT] Push token saved');
        } catch (error) {
          console.log('🚀 [BOOT] Push token save failed (ignored):', error);
        }
      } catch (error) {
        // IMPORTANTE: evita "Uncaught (in promise)" no bootstrap
        console.log('🚀 [BOOT] Push registration failed (ignored):', error);
      }
    };

    void run();
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
      console.log('🚀 [BOOT] isLoading=false -> hide splash');
      void SplashScreen.hideAsync()
        .then(() => {
          console.log('🚀 [BOOT] SplashScreen.hideAsync: OK');
        })
        .catch((error) => {
          console.log('🚀 [BOOT] SplashScreen.hideAsync: ERROR', error);
        });
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
