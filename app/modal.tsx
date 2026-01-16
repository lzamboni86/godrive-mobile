import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ModalScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between p-4 border-b border-neutral-200">
        <Text className="text-neutral-900 text-lg font-semibold">Modal</Text>
        <Pressable onPress={() => router.back()} className="p-2">
          <X size={24} color="#374151" />
        </Pressable>
      </View>
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-neutral-500 text-base text-center">
          Conteúdo do modal
        </Text>
      </View>
    </SafeAreaView>
  );
}
