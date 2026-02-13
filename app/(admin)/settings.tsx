import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Settings, LogOut, Shield, Database, Bell } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { router } from 'expo-router';

export default function AdminSettingsScreen() {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 24,
          paddingBottom: 24 + Math.max(insets.bottom, 16),
        }}
      >
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-32 h-32 rounded-full bg-red-500 items-center justify-center mb-4">
            <Text className="text-white text-4xl font-bold">A</Text>
          </View>
          <Text className="text-neutral-900 text-xl font-bold text-center">
            {user?.name || 'Administrador'}
          </Text>
          <Text className="text-red-500 text-sm font-medium mt-1">
            Administrador GoDrive
          </Text>
        </View>

        {/* Settings Menu */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <Text className="text-neutral-500 text-xs font-medium uppercase mb-3">
            Configurações do Sistema
          </Text>
          
          <TouchableOpacity className="flex-row items-center py-3 border-b border-neutral-100 active:bg-neutral-50">
            <Database size={20} color="#6B7280" />
            <View className="ml-3 flex-1">
              <Text className="text-neutral-900 text-base font-medium">Banco de Dados</Text>
              <Text className="text-neutral-500 text-sm">Gerenciar dados do sistema</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center py-3 border-b border-neutral-100 active:bg-neutral-50"
            onPress={() => router.push('/(common)/security-privacy' as any)}
          >
            <Shield size={20} color="#6B7280" />
            <View className="ml-3 flex-1">
              <Text className="text-neutral-900 text-base font-medium">Segurança</Text>
              <Text className="text-neutral-500 text-sm">Privacidade e segurança</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center py-3 border-b border-neutral-100 active:bg-neutral-50">
            <Bell size={20} color="#6B7280" />
            <View className="ml-3 flex-1">
              <Text className="text-neutral-900 text-base font-medium">Notificações</Text>
              <Text className="text-neutral-500 text-sm">Alertas do sistema</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center py-3 active:bg-neutral-50">
            <Settings size={20} color="#6B7280" />
            <View className="ml-3 flex-1">
              <Text className="text-neutral-900 text-base font-medium">Configurações</Text>
              <Text className="text-neutral-500 text-sm">Ajustes gerais</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* System Info */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <Text className="text-neutral-500 text-xs font-medium uppercase mb-3">
            Informações do Sistema
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-neutral-600 text-sm">Desenvolvedor</Text>
              <Text className="text-neutral-900 text-sm font-medium">Delta Pro Tecnologia</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-neutral-600 text-sm">Backend</Text>
              <Text className="text-neutral-900 text-sm font-medium">NestJS 10.0</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-neutral-600 text-sm">Database</Text>
              <Text className="text-neutral-900 text-sm font-medium">PostgreSQL</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-neutral-600 text-sm">Ambiente</Text>
              <Text className="text-neutral-900 text-sm font-medium">Produção</Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <View className="mb-8">
          <Button
            title="Sair da Conta"
            onPress={signOut}
            variant="outline"
            fullWidth
            icon={<LogOut size={20} color="#DC2626" />}
          />
          
          <Text className="text-center text-neutral-400 text-xs mt-4">
            Go Drive Group
          </Text>
          <Text className="text-center text-neutral-400 text-xs mt-1">
            Desenvolvido por: Delta Pro Tecnologia
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
