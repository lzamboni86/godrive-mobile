import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Bell, Shield, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentSettingsScreen() {
  const { signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-neutral-100">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-neutral-900">Configuração</Text>
          <View className="w-6" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Perfil */}
          <View className="p-4">
            <View className="bg-emerald-50 rounded-2xl p-4 mb-6">
              <View className="flex-row items-center">
                <View className="w-16 h-16 bg-emerald-500 rounded-full items-center justify-center mr-4">
                  <User size={32} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-emerald-900 font-semibold text-lg">João Aluno</Text>
                  <Text className="text-emerald-700 text-sm">joao.aluno@email.com</Text>
                  <Text className="text-emerald-600 text-xs mt-1">Aluno desde Dez/2025</Text>
                </View>
              </View>
            </View>

            {/* Configurações */}
            <View className="space-y-1">
              <TouchableOpacity className="bg-white border border-neutral-200 rounded-xl p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <User size={20} color="#6B7280" />
                    <Text className="text-neutral-900 font-medium ml-3">Editar Perfil</Text>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity className="bg-white border border-neutral-200 rounded-xl p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Bell size={20} color="#6B7280" />
                    <Text className="text-neutral-900 font-medium ml-3">Notificações</Text>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity className="bg-white border border-neutral-200 rounded-xl p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Shield size={20} color="#6B7280" />
                    <Text className="text-neutral-900 font-medium ml-3">Privacidade e Segurança</Text>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity className="bg-white border border-neutral-200 rounded-xl p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <HelpCircle size={20} color="#6B7280" />
                    <Text className="text-neutral-900 font-medium ml-3">Ajuda e Suporte</Text>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Sobre */}
            <View className="mt-6 mb-6">
              <Text className="text-neutral-500 text-sm font-medium mb-3">Sobre</Text>
              <View className="space-y-1">
                <TouchableOpacity className="bg-white border border-neutral-200 rounded-xl p-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-neutral-900 font-medium">Termos de Uso</Text>
                    <ChevronRight size={20} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity className="bg-white border border-neutral-200 rounded-xl p-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-neutral-900 font-medium">Política de Privacidade</Text>
                    <ChevronRight size={20} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity className="bg-white border border-neutral-200 rounded-xl p-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-neutral-900 font-medium">Versão</Text>
                    <Text className="text-neutral-500">1.0.0</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sair */}
            <TouchableOpacity 
              className="bg-red-50 border border-red-200 rounded-xl p-4"
              onPress={signOut}
            >
              <View className="flex-row items-center justify-center">
                <LogOut size={20} color="#EF4444" />
                <Text className="text-red-600 font-medium ml-2">Sair da Conta</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
