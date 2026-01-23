import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Bell, Shield, HelpCircle, LogOut, ChevronRight, Edit } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export default function InstructorSettingsScreen() {
  const { signOut, user } = useAuth();

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
            <View className="bg-blue-50 rounded-2xl p-4 mb-6">
              <View className="flex-row items-center">
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} className="w-16 h-16 rounded-full mr-4" />
                ) : (
                  <View className="w-16 h-16 bg-blue-500 rounded-full items-center justify-center mr-4">
                    <User size={32} color="#FFFFFF" />
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-blue-900 font-semibold text-lg">{user?.name || 'Instrutor'}</Text>
                  <Text className="text-blue-700 text-sm">{user?.email || 'instrutor@godrive.com'}</Text>
                  <Text className="text-blue-600 text-xs mt-1">Instrutor desde Dez/2025</Text>
                </View>
              </View>
            </View>

            {/* Configurações */}
            <View className="space-y-1">
              <TouchableOpacity 
                className="bg-white border border-neutral-200 rounded-xl p-4"
                onPress={() => router.push('edit-profile' as any)}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Edit size={20} color="#6B7280" />
                    <Text className="text-neutral-900 font-medium ml-3">Editar Perfil</Text>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                className="bg-white border border-neutral-200 rounded-xl p-4"
                onPress={() => Alert.alert('Notificações', 'Configurações de notificações em breve!')}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Bell size={20} color="#6B7280" />
                    <Text className="text-neutral-900 font-medium ml-3">Notificações</Text>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                className="bg-white border border-neutral-200 rounded-xl p-4"
                onPress={() => router.push('/(common)/security-privacy' as any)}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Shield size={20} color="#6B7280" />
                    <Text className="text-neutral-900 font-medium ml-3">Privacidade e Segurança</Text>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>

            </View>

            {/* Sobre */}
            <View className="mt-6 mb-6">
              <Text className="text-neutral-500 text-sm font-medium mb-3">Sobre</Text>
              <View className="space-y-1">
                <TouchableOpacity 
                  className="bg-white border border-neutral-200 rounded-xl p-4"
                  onPress={() => Linking.openURL('https://www.godrivegroup.com.br/termos-condicoes-uso')}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-neutral-900 font-medium">Termos de Uso</Text>
                    <ChevronRight size={20} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  className="bg-white border border-neutral-200 rounded-xl p-4"
                  onPress={() => Linking.openURL('https://www.godrivegroup.com.br/politica-privacidade')}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-neutral-900 font-medium">Política de Privacidade</Text>
                    <ChevronRight size={20} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity className="bg-white border border-neutral-200 rounded-xl p-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-neutral-900 font-medium">Desenvolvedor</Text>
                    <Text className="text-neutral-500">Delta Pro Tecnologia</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sair */}
            <View className="mt-6 mb-6">
              <Button
                title="Sair da Conta"
                onPress={signOut}
                variant="outline"
                fullWidth
                icon={<LogOut size={20} color="#1E3A8A" />}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
