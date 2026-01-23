import React from 'react';
import { View, Text, TouchableOpacity, Linking, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, LogOut, Mail, Phone, ShoppingBag, HelpCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { router } from 'expo-router';

export default function StudentProfileScreen() {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['bottom']}>
      <View className="flex-1 p-6" style={{ paddingBottom: 24 + Math.max(insets.bottom, 16) }}>
        <View className="items-center mb-8">
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} className="w-32 h-32 rounded-full mb-4" />
          ) : (
            <View className="w-32 h-32 rounded-full bg-emerald-500 items-center justify-center mb-4">
              <Text className="text-white text-4xl font-bold">
                {user?.name?.charAt(0) || 'A'}
              </Text>
            </View>
          )}
          <Text className="text-neutral-900 text-xl font-bold text-center">
            {user?.name || 'Aluno'}
          </Text>
          <Text className="text-emerald-500 text-sm font-medium mt-1">
            Aluno GoDrive
          </Text>
        </View>

        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <Text className="text-neutral-500 text-xs font-medium uppercase mb-3">
            Informações de Contato
          </Text>
          
          <View className="flex-row items-center py-3 border-b border-neutral-100">
            <Mail size={20} color="#6B7280" />
            <View className="ml-3">
              <Text className="text-neutral-400 text-xs">Email</Text>
              <Text className="text-neutral-900 text-base">
                {user?.email || 'aluno@godrive.com'}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center py-3">
            <Phone size={20} color="#6B7280" />
            <View className="ml-3">
              <Text className="text-neutral-400 text-xs">Telefone</Text>
              <Text className="text-neutral-900 text-base">
                {user?.phone || '(11) 99999-9999'}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <Text className="text-neutral-500 text-xs font-medium uppercase mb-3">
            Serviços
          </Text>
          
          <TouchableOpacity 
            className="flex-row items-center py-3 border-b border-neutral-100 active:bg-neutral-50"
            onPress={() => router.push('services' as any)}
          >
            <ShoppingBag size={20} color="#10B981" />
            <View className="ml-3 flex-1">
              <Text className="text-neutral-900 text-base font-medium">Hub de Serviços</Text>
              <Text className="text-neutral-500 text-sm">Acessar todos os serviços</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center py-3 active:bg-neutral-50"
            onPress={() => router.push('support' as any)}
          >
            <HelpCircle size={20} color="#3B82F6" />
            <View className="ml-3 flex-1">
              <Text className="text-neutral-900 text-base font-medium">Contato SAC</Text>
              <Text className="text-neutral-500 text-sm">Fale com nosso suporte</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="mt-auto">
          <Text className="text-center text-neutral-400 text-xs mt-4">
            GoDrive v1.0.3 • Delta Pro Tecnologia
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
