import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, ArrowLeft, Calendar } from 'lucide-react-native';
import { router } from 'expo-router';

export default function ScheduleSuccessScreen() {
  const handleGoToAgenda = () => {
    router.replace('/(student)/agenda');
  };

  const handleGoHome = () => {
    router.replace('/(student)/index' as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-neutral-100">
          <TouchableOpacity onPress={handleGoHome}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-neutral-900">Sucesso!</Text>
          <View className="w-6" />
        </View>

        <View className="flex-1 items-center justify-center px-6">
          {/* Ícone de Sucesso */}
          <View className="w-24 h-24 bg-emerald-100 rounded-full items-center justify-center mb-6">
            <CheckCircle size={48} color="#10B981" />
          </View>

          {/* Mensagem Principal */}
          <Text className="text-2xl font-bold text-neutral-900 text-center mb-4">
            Solicitação enviada!
          </Text>
          
          <Text className="text-neutral-600 text-center mb-8">
            Aguardando aprovação do instrutor. Você receberá uma notificação assim que sua solicitação for analisada.
          </Text>

          {/* Informações Adicionais */}
          <View className="bg-neutral-50 rounded-xl p-4 w-full mb-8">
            <View className="flex-row items-center mb-3">
              <Calendar size={20} color="#6B7280" />
              <Text className="text-neutral-900 font-medium ml-2">O que acontece agora?</Text>
            </View>
            <Text className="text-neutral-600 text-sm leading-relaxed">
              1. O instrutor tem até 24h para aprovar ou recusar sua solicitação{'\n\n'}
              2. Se aprovado, as aulas serão confirmadas em sua agenda{'\n\n'}
              3. Em caso de recusa, o valor será reembolsado integralmente{'\n\n'}
              4. Você pode acompanhar o status em "Minha Agenda"
            </Text>
          </View>

          {/* Botões de Ação */}
          <View className="w-full space-y-3">
            <TouchableOpacity 
              className="bg-emerald-500 rounded-xl p-4"
              onPress={handleGoToAgenda}
            >
              <Text className="text-white text-center font-semibold text-lg">
                Ver Minha Agenda
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-neutral-100 rounded-xl p-4"
              onPress={handleGoHome}
            >
              <Text className="text-neutral-700 text-center font-semibold">
                Voltar para Início
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
