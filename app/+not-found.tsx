import React from 'react';
import { View, Text } from 'react-native';
import { Link, Stack } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-xl font-bold text-neutral-900">
          Esta tela não existe.
        </Text>
        <Link href="/" className="mt-4 py-4">
          <Text className="text-primary-500 text-base">
            Voltar para o início
          </Text>
        </Link>
      </View>
    </>
  );
}
