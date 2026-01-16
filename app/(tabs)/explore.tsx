import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Compass } from 'lucide-react-native';

export default function ExploreScreen() {
  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['bottom']}>
      <View className="flex-1 items-center justify-center p-6">
        <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-4">
          <Compass size={40} color="#0A84FF" />
        </View>
        <Text className="text-neutral-900 text-xl font-semibold text-center mb-2">
          Explorar
        </Text>
        <Text className="text-neutral-500 text-base text-center">
          Em breve você poderá explorar novos recursos aqui.
        </Text>
      </View>
    </SafeAreaView>
  );
}
