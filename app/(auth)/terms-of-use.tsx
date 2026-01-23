import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ExternalLink } from 'lucide-react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import * as WebBrowser from 'expo-web-browser';

export default function TermsOfUseScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-neutral-100">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-neutral-900">Termo de Uso</Text>
          <View className="w-6" />
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-6 py-4">
          <Text className="text-neutral-700 leading-relaxed">
            Estes Termos de Uso regem o uso do aplicativo Go Drive e os serviços oferecidos pela plataforma.
          </Text>

          <Text className="text-neutral-900 font-semibold mt-6 mb-2">1. Aceitação dos Termos</Text>
          <Text className="text-neutral-700 leading-relaxed">
            Ao usar o Go Drive, você concorda com estes termos e condições. Se não concordar, não utilize nossos serviços.
          </Text>

          <Text className="text-neutral-900 font-semibold mt-6 mb-2">2. Descrição dos Serviços</Text>
          <Text className="text-neutral-700 leading-relaxed">
            O Go Drive é uma plataforma que conecta alunos a instrutores de autoescola, facilitando o agendamento de aulas práticas de direção.
          </Text>

          <Text className="text-neutral-900 font-semibold mt-6 mb-2">3. Responsabilidades do Usuário</Text>
          <Text className="text-neutral-700 leading-relaxed">
            Você é responsável por: fornecer informações verdadeiras, manter seus dados atualizados, realizar pagamentos em dia e comportar-se adequadamente durante as aulas.
          </Text>

          <Text className="text-neutral-900 font-semibold mt-6 mb-2">4. Pagamentos e Reembolsos</Text>
          <Text className="text-neutral-700 leading-relaxed">
            Os pagamentos são processados através de plataformas seguras. Políticas de reembolso seguem as regras estabelecidas por cada instrutor e pela plataforma.
          </Text>

          <Text className="text-neutral-900 font-semibold mt-6 mb-2">5. Cancelamentos</Text>
          <Text className="text-neutral-700 leading-relaxed">
            Aulas podem ser canceladas conforme as políticas de cancelamento estabelecidas. Cancelamentos de última hora podem estar sujeitos a taxas.
          </Text>

          <Text className="text-neutral-900 font-semibold mt-6 mb-2">6. Propriedade Intelectual</Text>
          <Text className="text-neutral-700 leading-relaxed">
            Todo o conteúdo do Go Drive, incluindo logos, textos e design, é protegido por direitos autorais e não pode ser utilizado sem autorização.
          </Text>

          <Text className="text-neutral-900 font-semibold mt-6 mb-2">7. Limitação de Responsabilidade</Text>
          <Text className="text-neutral-700 leading-relaxed">
            O Go Drive não se responsabiliza por acidentes ou problemas ocorridos durante as aulas, que são de responsabilidade dos instrutores e autoescolas credenciadas.
          </Text>

          <Text className="text-neutral-900 font-semibold mt-6 mb-2">8. Contato</Text>
          <Text className="text-neutral-700 leading-relaxed">
            Para dúvidas sobre estes termos, entre em contato através do nosso site ou suporte.
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
              WebBrowser.openBrowserAsync('https://www.godrivegroup.com.br/termos-condicoes-uso');
            }}
            className="bg-brand-primary py-3 rounded-xl"
          >
            <Text className="text-white text-base font-semibold">Ver Termos Completos</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
