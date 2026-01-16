import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, LogOut, Shield, Database, Bell } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminSettingsScreen() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['bottom']}>
      <View className="flex-1 p-6">
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-red-500 items-center justify-center mb-4">
            <Text className="text-white text-3xl font-bold">A</Text>
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

          <TouchableOpacity className="flex-row items-center py-3 border-b border-neutral-100 active:bg-neutral-50">
            <Shield size={20} color="#6B7280" />
            <View className="ml-3 flex-1">
              <Text className="text-neutral-900 text-base font-medium">Segurança</Text>
              <Text className="text-neutral-500 text-sm">Permissões e acessos</Text>
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
              <Text className="text-neutral-600 text-sm">Versão do App</Text>
              <Text className="text-neutral-900 text-sm font-medium">1.0.0</Text>
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
        <View className="mt-auto">
          <TouchableOpacity
            onPress={signOut}
            className="bg-red-500 rounded-xl p-4 active:scale-95 transition-transform"
          >
            <Text className="text-white text-center font-semibold text-base">
              Sair da Conta
            </Text>
          </TouchableOpacity>
          
          <Text className="text-center text-neutral-400 text-xs mt-4">
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
