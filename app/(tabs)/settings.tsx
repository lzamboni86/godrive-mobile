import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Calendar, Headphones, HelpCircle, User } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['bottom']}>
      <View className="flex-1 p-6">
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-blue-500 items-center justify-center mb-4">
            <Text className="text-white text-3xl font-bold">
              {user?.name?.charAt(0) || 'I'}
            </Text>
          </View>
          <Text className="text-neutral-900 text-xl font-bold text-center">
            {user?.name || 'Instrutor'}
          </Text>
          <Text className="text-blue-500 text-sm font-medium mt-1">
            Instrutor GoDrive
          </Text>
        </View>

        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <Text className="text-neutral-500 text-xs font-medium uppercase mb-3">
            Menu
          </Text>
          
          <TouchableOpacity className="flex-row items-center py-3 border-b border-neutral-100 active:bg-neutral-50">
            <Calendar size={20} color="#1E3A8A" />
            <View className="ml-3 flex-1">
              <Text className="text-neutral-900 text-base font-medium">Solicitações de Aulas</Text>
              <Text className="text-neutral-500 text-sm">Gerencie novas solicitações</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center py-3 border-b border-neutral-100 active:bg-neutral-50">
            <Headphones size={20} color="#10B981" />
            <View className="ml-3 flex-1">
              <Text className="text-neutral-900 text-base font-medium">Hub de Serviços</Text>
              <Text className="text-neutral-500 text-sm">Acessar todos os serviços</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center py-3 active:bg-neutral-50">
            <HelpCircle size={20} color="#3B82F6" />
            <View className="ml-3 flex-1">
              <Text className="text-neutral-900 text-base font-medium">Contato SAC</Text>
              <Text className="text-neutral-500 text-sm">Fale com nosso suporte</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <Text className="text-neutral-500 text-xs font-medium uppercase mb-3">
            Configurações
          </Text>
          
          <TouchableOpacity className="flex-row items-center py-3 border-b border-neutral-100 active:bg-neutral-50">
            <User size={20} color="#6B7280" />
            <View className="ml-3 flex-1">
              <Text className="text-neutral-900 text-base font-medium">Perfil</Text>
              <Text className="text-neutral-500 text-sm">Editar informações pessoais</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center py-3 active:bg-neutral-50">
            <Settings size={20} color="#6B7280" />
            <View className="ml-3 flex-1">
              <Text className="text-neutral-900 text-base font-medium">Configurações</Text>
              <Text className="text-neutral-500 text-sm">Ajustes do aplicativo</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="mt-auto">
          <Button
            title="Sair da Conta"
            onPress={signOut}
            variant="outline"
            fullWidth
          />
          <Text className="text-center text-neutral-400 text-xs mt-4">
            GoDrive v1.0.0 • Delta Pro Tecnologia
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
