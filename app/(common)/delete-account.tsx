import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, AlertTriangle, Trash2, Shield } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { api } from '@/services/api';

export default function DeleteAccountScreen() {
  const { signOut, user } = useAuth();
  const [confirmationText, setConfirmationText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: warning, 2: confirmation, 3: processing

  const handleDeleteAccount = async () => {
    if (confirmationText !== 'EXCLUIR') {
      Alert.alert('Erro', 'Digite "EXCLUIR" para confirmar a exclusão da conta.');
      return;
    }

    setIsLoading(true);
    setStep(3);

    try {
      console.log('🗑️ [DELETE-ACCOUNT] Iniciando exclusão da conta:', user?.id);
      
      // Chamar endpoint de exclusão
      await api.delete('/auth/delete-account');
      
      console.log('✅ [DELETE-ACCOUNT] Conta excluída com sucesso');
      
      Alert.alert(
        'Conta Excluída',
        'Sua conta foi excluída com sucesso. Todos os seus dados foram removidos permanentemente.',
        [
          {
            text: 'OK',
            onPress: () => {
              signOut();
              router.replace('/(auth)/login');
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ [DELETE-ACCOUNT] Erro ao excluir conta:', error);
      
      const errorMessage = error?.response?.data?.message || 
        error?.message || 
        'Não foi possível excluir sua conta. Tente novamente ou entre em contato com o suporte.';
      
      Alert.alert(
        'Erro na Exclusão',
        errorMessage,
        [{ text: 'OK' }]
      );
      
      // Voltar para o passo anterior em caso de erro
      setStep(2);
    } finally {
      setIsLoading(false);
    }
  };

  const renderWarningStep = () => (
    <View className="p-6">
      <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
        <View className="flex-row items-start mb-3">
          <AlertTriangle size={24} color="#DC2626" className="mr-3 mt-1" />
          <View className="flex-1">
            <Text className="text-red-900 font-semibold text-lg mb-2">Ação Irreversível</Text>
            <Text className="text-red-700 text-sm leading-relaxed">
              Esta ação não pode ser desfeita. Ao excluir sua conta:
            </Text>
          </View>
        </View>
        
        <View className="space-y-2 mt-4">
          <Text className="text-red-700 text-sm">• Todos os seus dados pessoais serão permanentemente removidos</Text>
          <Text className="text-red-700 text-sm">• Seu histórico de aulas e pagamentos será excluído</Text>
          <Text className="text-red-700 text-sm">• Você perderá acesso a todos os recursos do app</Text>
          <Text className="text-red-700 text-sm">• Não será possível recuperar sua conta</Text>
        </View>
      </View>

      <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
        <View className="flex-row items-start">
          <Shield size={24} color="#1E3A8A" className="mr-3 mt-1" />
          <View className="flex-1">
            <Text className="text-blue-900 font-semibold text-base mb-2">LGPD - Lei Geral de Proteção de Dados</Text>
            <Text className="text-blue-700 text-sm leading-relaxed">
              Conforme a LGPD, você tem direito à exclusão de seus dados pessoais. Ao confirmar, 
              procederemos com a exclusão imediata e permanente de todas as suas informações.
            </Text>
          </View>
        </View>
      </View>

      <Button
        title="Continuar para Exclusão"
        onPress={() => setStep(2)}
        variant="danger"
        fullWidth
        icon={<Trash2 size={20} color="#FFFFFF" />}
      />
    </View>
  );

  const renderConfirmationStep = () => (
    <View className="p-6">
      <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
        <Text className="text-red-900 font-semibold text-lg mb-3 text-center">
          Confirmação Final
        </Text>
        <Text className="text-red-700 text-sm text-center mb-4">
          Para confirmar a exclusão da conta, digite "EXCLUIR" (em maiúsculas) no campo abaixo:
        </Text>
        
        <TextInput
          value={confirmationText}
          onChangeText={setConfirmationText}
          className="bg-white border border-red-300 rounded-xl px-4 py-3 text-red-900 text-center font-mono text-lg"
          placeholder="EXCLUIR"
          placeholderTextColor="#EF4444"
          autoCapitalize="characters"
          autoCorrect={false}
        />
      </View>

      <View className="space-y-3">
        <Button
          title="Excluir Conta Permanentemente"
          onPress={handleDeleteAccount}
          variant="danger"
          fullWidth
          disabled={isLoading || confirmationText !== 'EXCLUIR'}
          icon={<Trash2 size={20} color="#FFFFFF" />}
        />
        
        <TouchableOpacity
          onPress={() => setStep(1)}
          className="border border-gray-300 rounded-xl py-3 px-4"
          disabled={isLoading}
        >
          <Text className="text-gray-700 text-center font-medium">Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProcessingStep = () => (
    <View className="p-6 flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#DC2626" className="mb-4" />
      <Text className="text-red-900 font-semibold text-lg mb-2">Excluindo sua conta...</Text>
      <Text className="text-gray-600 text-sm text-center">
        Por favor, aguarde. Este processo pode levar alguns segundos.
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-gray-900">Excluir Conta</Text>
          <View className="w-8" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {step === 1 && renderWarningStep()}
          {step === 2 && renderConfirmationStep()}
          {step === 3 && renderProcessingStep()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
