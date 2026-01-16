import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ShoppingBag, Tag, Gift, Percent, Star } from 'lucide-react-native';
import { router } from 'expo-router';

export default function StudentServicesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-neutral-100">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-neutral-900">Hub de Serviços</Text>
          <View className="w-6" />
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Banner de Lançamento em Breve - DESTAQUE */}
          <View className="bg-amber-100 border-2 border-amber-400 rounded-2xl p-4">
            <View className="flex-row items-center justify-center">
              <Text className="text-amber-800 text-lg font-bold text-center">
                🚀 Lançamento em breve
              </Text>
            </View>
            <Text className="text-amber-700 text-sm text-center mt-2">
              Esta funcionalidade está em desenvolvimento e será liberada em breve!
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
