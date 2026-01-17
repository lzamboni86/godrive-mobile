import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCircle, ArrowLeft, Clock } from 'lucide-react-native';
import { router } from 'expo-router';

export default function SchedulePendingScreen() {
  const handleGoToAgenda = () => {
    router.replace('/(student)/agenda' as any);
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
          <Text className="text-lg font-semibold text-neutral-900">Pagamento pendente</Text>
          <View className="w-6" />
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 bg-amber-100 rounded-full items-center justify-center mb-6">
            <Clock size={48} color="#F59E0B" />
          </View>

          <Text className="text-2xl font-bold text-neutral-900 text-center mb-4">Pagamento em processamento</Text>

          <Text className="text-neutral-600 text-center mb-8">
            Recebemos sua solicitação. Assim que o pagamento for confirmado, suas aulas aparecerão na agenda.
          </Text>

          <View className="bg-neutral-50 rounded-xl p-4 w-full mb-8">
            <View className="flex-row items-center mb-3">
              <AlertCircle size={20} color="#6B7280" />
              <Text className="text-neutral-900 font-medium ml-2">O que fazer agora?</Text>
            </View>
            <Text className="text-neutral-600 text-sm leading-relaxed">
              1. Aguarde alguns instantes e volte para a agenda{`\n\n`}
              2. Se não atualizar, feche e abra o app novamente{`\n\n`}
              3. Persistindo, entre em contato com o suporte (SAC)
            </Text>
          </View>

          <View className="w-full space-y-3">
            <TouchableOpacity className="bg-emerald-500 rounded-xl p-4" onPress={handleGoToAgenda}>
              <Text className="text-white text-center font-semibold text-lg">Ver Minha Agenda</Text>
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
