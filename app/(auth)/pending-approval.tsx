import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, Clock, Mail, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

export default function PendingApprovalScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <View className="flex-1 px-6 pt-20 pb-8">
        {/* Header */}
        <View className="items-center mb-12">
          <TouchableOpacity 
            onPress={() => router.replace('/(auth)/login')}
            className="absolute left-0 top-0 p-2"
          >
            <ArrowLeft size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <View className="w-24 h-24 bg-blue-100 rounded-3xl items-center justify-center mb-6">
            <Clock size={40} color="#3B82F6" />
          </View>
          <Text className="text-3xl font-bold text-blue-600">Cadastro Recebido!</Text>
          <Text className="text-neutral-500 mt-2 text-base">Seu cadastro está em análise</Text>
        </View>

        {/* Success Message */}
        <View className="bg-blue-50 rounded-2xl p-6 mb-8 border border-blue-200">
          <View className="items-center mb-4">
            <CheckCircle size={48} color="#10B981" />
          </View>
          <Text className="text-blue-900 text-lg font-semibold text-center mb-3">
            Obrigado pelo seu interesse!
          </Text>
          <Text className="text-blue-700 text-center leading-relaxed">
            Recebemos sua solicitação de cadastro como instrutor parceiro. Nossa equipe administrativa irá analisar suas informações e entrará em contato em até 48 horas úteis.
          </Text>
        </View>

        {/* Next Steps */}
        <View className="space-y-4 mb-8">
          <Text className="text-neutral-900 text-lg font-semibold">Próximos Passos:</Text>
          
          <View className="bg-neutral-50 rounded-xl p-4">
            <View className="flex-row items-start mb-3">
              <View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center mr-3 mt-0.5">
                <Text className="text-white text-xs font-bold">1</Text>
              </View>
              <View className="flex-1">
                <Text className="text-neutral-900 font-medium mb-1">Análise Administrativa</Text>
                <Text className="text-neutral-600 text-sm">Verificação da CNH e documentos do veículo</Text>
              </View>
            </View>
            
            <View className="flex-row items-start mb-3">
              <View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center mr-3 mt-0.5">
                <Text className="text-white text-xs font-bold">2</Text>
              </View>
              <View className="flex-1">
                <Text className="text-neutral-900 font-medium mb-1">Contato por WhatsApp</Text>
                <Text className="text-neutral-600 text-sm">Enviaremos mensagem para seu WhatsApp</Text>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center mr-3 mt-0.5">
                <Text className="text-white text-xs font-bold">3</Text>
              </View>
              <View className="flex-1">
                <Text className="text-neutral-900 font-medium mb-1">Ativação da Conta</Text>
                <Text className="text-neutral-600 text-sm">Acesso liberado à plataforma Go Drive</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View className="bg-neutral-50 rounded-xl p-4 mb-8">
          <View className="flex-row items-center mb-2">
            <Mail size={20} color="#6B7280" />
            <Text className="text-neutral-700 font-medium ml-2">Dúvidas?</Text>
          </View>
          <Text className="text-neutral-600 text-sm ml-7">
            Entre em contato pelo email suporte@godrive.com.br
          </Text>
        </View>

        {/* Back to Login Button */}
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          className="bg-blue-500 rounded-xl p-4 active:scale-95 transition-transform"
        >
          <Text className="text-white text-center font-semibold text-base">
            Voltar para o Login
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <View className="mt-auto pt-8">
          <Text className="text-center text-neutral-400 text-xs">
            Go Drive Group
          </Text>
          <Text className="text-center text-neutral-400 text-xs mt-1">
            Desenvolvido por: Delta Pro Tecnologia
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
