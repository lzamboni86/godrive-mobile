import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, AlertTriangle, Trash2, Shield } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

export default function DeleteAccountScreen() {
  const { signOut, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleDeleteAccount = async () => {
    if (!isConfirmed) {
      Alert.alert(
        'Atenção!',
        'Para excluir sua conta, você precisa confirmar esta ação digitando "EXCLUIR".',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Excluir Conta',
      'Tem certeza que deseja excluir sua conta? Esta ação é IRREVERSÍVEL e:\n\n• Apagará todos os seus dados\n• Cancelará aulas agendadas\n• Removerá seu histórico\n• Não poderá ser desfeita',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir Permanentemente',
          style: 'destructive',
          onPress: executeDeleteAccount,
        },
      ]
    );
  };

  const executeDeleteAccount = async () => {
    try {
      setIsLoading(true);
      
      console.log('🗑️ [DELETE-ACCOUNT] Iniciando exclusão da conta:', user?.id);
      
      // Chamar endpoint para exclusão de conta
      await api.delete('/auth/delete-account');
      
      console.log('✅ [DELETE-ACCOUNT] Conta excluída com sucesso');
      
      Alert.alert(
        'Conta Excluída',
        'Sua conta foi excluída permanentemente. Você será desconectado.',
        [
          {
            text: 'OK',
            onPress: async () => {
              await signOut();
              router.replace('/(auth)/login');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ [DELETE-ACCOUNT] Erro ao excluir conta:', error);
      
      const errorMessage = error?.response?.data?.message || error?.message || 'Não foi possível excluir sua conta. Tente novamente.';
      
      Alert.alert(
        'Erro',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-gray-900">Excluir Conta</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {/* Alerta Principal */}
        <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <View className="flex-row items-start">
            <AlertTriangle size={24} color="#DC2626" className="mr-3 mt-1" />
            <View className="flex-1">
              <Text className="text-red-900 font-semibold text-lg mb-2">Ação Irreversível</Text>
              <Text className="text-red-700 text-sm leading-relaxed">
                A exclusão da conta é permanente e não pode ser desfeita. Todos os seus dados serão removidos permanentemente do sistema.
              </Text>
            </View>
          </View>
        </View>

        {/* O que será perdido */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-gray-900 font-semibold text-base mb-4">O que será perdido:</Text>
          
          <View className="space-y-3">
            <View className="flex-row items-start">
              <View className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3" />
              <Text className="text-gray-700 text-sm flex-1">Perfil e informações pessoais</Text>
            </View>
            
            <View className="flex-row items-start">
              <View className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3" />
              <Text className="text-gray-700 text-sm flex-1">Histórico de aulas e agendamentos</Text>
            </View>
            
            <View className="flex-row items-start">
              <View className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3" />
              <Text className="text-gray-700 text-sm flex-1">Pagamentos e transações</Text>
            </View>
            
            <View className="flex-row items-start">
              <View className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3" />
              <Text className="text-gray-700 text-sm flex-1">Mensagens e avaliações</Text>
            </View>
            
            <View className="flex-row items-start">
              <View className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3" />
              <Text className="text-gray-700 text-sm flex-1">Foto de perfil e documentos</Text>
            </View>
          </View>
        </View>

        {/* Alternativas */}
        <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <View className="flex-row items-start">
            <Shield size={20} color="#2563EB" className="mr-3 mt-1" />
            <View className="flex-1">
              <Text className="text-blue-900 font-semibold text-base mb-2">Alternativas</Text>
              <Text className="text-blue-700 text-sm leading-relaxed">
                Se você está having problemas com o app, considere:\n\n• Entrar em contato com o suporte\n• Fazer logout e login novamente\n• Desinstalar e reinstalar o app\n• Alterar suas configurações de privacidade
              </Text>
            </View>
          </View>
        </View>

        {/* Confirmação */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-gray-900 font-semibold text-base mb-3">Confirmação</Text>
          <Text className="text-gray-600 text-sm mb-4">
            Para continuar, digite "EXCLUIR" no campo abaixo:
          </Text>
          
          <TextInput
            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
            placeholder="Digite EXCLUIR"
            placeholderTextColor="#9CA3AF"
            onChangeText={(text: string) => setIsConfirmed(text.toUpperCase() === 'EXCLUIR')}
            autoCapitalize="characters"
          />
        </View>

        {/* Botão de Exclusão */}
        <TouchableOpacity
          onPress={handleDeleteAccount}
          disabled={!isConfirmed || isLoading}
          className={`rounded-xl py-4 flex-row items-center justify-center ${
            !isConfirmed || isLoading 
              ? 'bg-gray-300' 
              : 'bg-red-600'
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Trash2 size={20} color="#FFFFFF" className="mr-2" />
              <Text className="text-white font-semibold text-lg">Excluir Conta Permanentemente</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Informações de Contato */}
        <View className="mt-8 p-4 bg-gray-100 rounded-xl">
          <Text className="text-gray-600 text-sm text-center">
            Precisa de ajuda? Entre em contato com nosso suporte através da seção SAC no app.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
