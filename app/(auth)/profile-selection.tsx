import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GraduationCap, Car, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

export default function ProfileSelectionScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <View className="flex-1 px-6 pt-20 pb-8">
        {/* Header */}
        <View className="items-center mb-12">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="absolute left-0 top-0 p-2"
          >
            <ArrowLeft size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <View className="w-24 h-24 bg-brand-primary rounded-3xl items-center justify-center mb-6">
            <Text className="text-white text-4xl font-bold">G</Text>
          </View>
          <Text className="text-3xl font-bold text-brand-primary">GO DRIVE</Text>
          <Text className="text-neutral-500 mt-2 text-base">Escolha seu perfil</Text>
        </View>

        {/* Profile Options */}
        <View className="space-y-4">
          <Text className="text-neutral-900 text-lg font-semibold mb-6 text-center">
            Como você quer usar o Go Drive?
          </Text>

          {/* Student Option */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/signup/student')}
            className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 active:scale-95 transition-transform"
          >
            <View className="items-center">
              <View className="w-16 h-16 rounded-full bg-emerald-500 items-center justify-center mb-4">
                <GraduationCap size={32} color="#FFFFFF" />
              </View>
              <Text className="text-emerald-900 text-xl font-bold mb-2">
                Quero aprender a dirigir
              </Text>
              <Text className="text-emerald-700 text-center text-sm">
                Sou um aluno buscando aulas práticas para conquistar minha habilitação
              </Text>
            </View>
          </TouchableOpacity>

          {/* Instructor Option */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/signup/instructor')}
            className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 active:scale-95 transition-transform"
          >
            <View className="items-center">
              <View className="w-16 h-16 rounded-full bg-blue-500 items-center justify-center mb-4">
                <Car size={32} color="#FFFFFF" />
              </View>
              <Text className="text-blue-900 text-xl font-bold mb-2">
                Quero ser um instrutor parceiro
              </Text>
              <Text className="text-blue-700 text-center text-sm">
                Sou um instrutor experiente e quero dar aulas através da plataforma
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="mt-auto pt-8">
          <Text className="text-center text-neutral-400 text-xs">
            © 2025 Delta Pro Tecnologia
          </Text>
          <Text className="text-center text-neutral-400 text-xs mt-1">
            Versão 1.0.0
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
