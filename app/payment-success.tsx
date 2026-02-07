import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Redirecionar para a tela apropriada após processar o deep link
    const timer = setTimeout(() => {
      if (user?.role === 'INSTRUCTOR') {
        router.replace('/(tabs)');
      } else {
        router.replace('/(student)/agenda' as any);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [router, user]);

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <View className="items-center">
        <ActivityIndicator size="large" color="#10B981" className="mb-4" />
        <Text className="text-xl font-semibold text-neutral-900 text-center mb-2">
          Processando pagamento...
        </Text>
        <Text className="text-neutral-600 text-center">
          Redirecionando para o app em instantes.
        </Text>
      </View>
    </View>
  );
}
