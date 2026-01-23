import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ExternalLink } from 'lucide-react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import * as WebBrowser from 'expo-web-browser';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-neutral-100">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-neutral-900">Política de Privacidade</Text>
          <View className="w-6" />
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-6 py-4">
          <Text className="text-neutral-700 leading-relaxed">
            A sua privacidade é importante para nós. Esta Política de Privacidade descreve como coletamos, usamos e protegemos suas informações ao utilizar o aplicativo Go Drive.
          </Text>

          <Text className="text-neutral-900 font-semibold mt-6 mb-2">1. Informações Coletadas</Text>
          <Text className="text-neutral-700 leading-relaxed">
            Coletamos informações como nome, email, telefone, dados de perfil e informações de pagamento quando necessário para fornecer nossos serviços.
          </Text>

          <Text className="text-neutral-900 font-semibold mt-6 mb-2">2. Uso das Informações</Text>
          <Text className="text-neutral-700 leading-relaxed">
            Utilizamos suas informações para: fornecer serviços de agendamento, processar pagamentos, melhorar nossa plataforma e comunicar informações importantes sobre sua conta.
          </Text>

          <Text className="text-neutral-900 font-semibold mt-6 mb-2">3. Compartilhamento</Text>
          <Text className="text-neutral-700 leading-relaxed">
            Não compartilhamos suas informações pessoais com terceiros, exceto quando necessário para operar nossos serviços ou quando exigido por lei.
          </Text>

          <Text className="text-neutral-900 font-semibold mt-6 mb-2">4. Segurança</Text>
          <Text className="text-neutral-700 leading-relaxed">
            Implementamos medidas de segurança adequadas para proteger suas informações contra acesso não autorizado ou perda.
          </Text>

          <Text className="text-neutral-900 font-semibold mt-6 mb-2">5. Contato</Text>
          <Text className="text-neutral-700 leading-relaxed">
            Para dúvidas sobre esta política, entre em contato através do nosso site ou suporte.
          </Text>

          <View className="mt-8 p-4 bg-neutral-50 rounded-xl">
            <View className="flex-row items-center">
              <ExternalLink size={16} color="#10B981" className="mr-2" />
              <Text className="text-neutral-700 text-sm">
                Versão completa disponível em nosso site
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View className="p-4 border-t border-neutral-100">
          <Button
            onPress={() => {
              // Abrir link externo usando WebBrowser
              WebBrowser.openBrowserAsync('https://www.godrivegroup.com.br/politica-privacidade');
            }}
            className="bg-brand-primary py-3 rounded-xl"
          >
            <Text className="text-white text-base font-semibold">Ver Política Completa</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
