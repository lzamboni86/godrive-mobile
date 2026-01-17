import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react-native';
import { router } from 'expo-router';

export default function ScheduleFailureScreen() {
  const handleTryAgain = () => {
    router.replace('/(student)/schedule' as any);
  };

  const handleGoHome = () => {
    router.replace('/(student)/index' as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between p-4 border-b border-neutral-100">
          <TouchableOpacity onPress={handleGoHome}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-neutral-900">Pagamento não concluído</Text>
          <View className="w-6" />
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 bg-red-100 rounded-full items-center justify-center mb-6">
            <AlertTriangle size={48} color="#EF4444" />
          </View>

          <Text className="text-2xl font-bold text-neutral-900 text-center mb-4">Não foi possível confirmar o pagamento</Text>

          <Text className="text-neutral-600 text-center mb-8">
            Você pode tentar novamente. Se o valor foi debitado, aguarde alguns minutos e verifique sua agenda.
          </Text>

          <View className="w-full space-y-3">
            <TouchableOpacity className="bg-emerald-500 rounded-xl p-4" onPress={handleTryAgain}>
              <View className="flex-row items-center justify-center">
                <RefreshCw size={18} color="#FFFFFF" />
                <Text className="text-white text-center font-semibold text-lg ml-2">Tentar novamente</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-neutral-100 rounded-xl p-4" onPress={handleGoHome}>
              <Text className="text-neutral-700 text-center font-semibold">Voltar para Início</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
