import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, Calendar, DollarSign, CheckCircle, AlertCircle } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { studentService, Instructor } from '@/services/student';
import { useAuth } from '@/contexts/AuthContext';

interface ScheduleData {
  instructorId: string;
  selectedDates: string[];
  selectedTimes: { date: string; time: string }[];
}

// Preço dinâmico do instrutor (removido hardcoded)

export default function ScheduleStep3Screen() {
  const { user } = useAuth();
  const { id, dates, times } = useLocalSearchParams<{ id: string; dates: string; times: string }>();
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDates] = useState<string[]>(JSON.parse(dates || '[]'));
  const [selectedTimes] = useState<{ date: string; time: string }[]>(JSON.parse(times || '[]'));

  useEffect(() => {
    if (id) {
      loadInstructor();
    }
  }, [id]);

  const loadInstructor = async () => {
    try {
      setIsLoading(true);
      const instructors = await studentService.getApprovedInstructors();
      const found = instructors.find(i => i.id === id);
      setInstructor(found || null);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar os dados do instrutor.');
      console.error('Erro ao carregar instrutor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!instructor?.hourlyRate) {
      throw new Error('Preço do instrutor não encontrado');
    }
    return selectedTimes.length * instructor.hourlyRate;
  };

  const handleSubmit = async () => {
    if (!user?.id || !instructor) {
      Alert.alert('Erro', 'Dados do usuário ou instrutor não encontrados.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Criar solicitação de agendamento
      const scheduleData = {
        studentId: user.id,
        instructorId: instructor.id,
        lessons: selectedTimes.map(time => ({
          date: time.date,
          time: time.time,
          duration: 50,
          price: instructor.hourlyRate || 0
        })),
        totalAmount: calculateTotal(),
        status: 'PENDING_PAYMENT'
      };

      // Enviar para backend
      const response = await studentService.createScheduleRequest(scheduleData);
      
      console.log('📦 Resposta do backend:', JSON.stringify(response, null, 2));
      
      // Se tiver preference_id do Mercado Pago, iniciar pagamento
      const isSandbox = !!(response as any).isSandbox;
      const checkoutUrl =
        isSandbox && response.sandboxInitPoint
          ? response.sandboxInitPoint
          : response.initPoint;

      if (!checkoutUrl) {
        Alert.alert('Erro', 'Não foi possível iniciar o pagamento. Tente novamente.');
        return;
      }

      console.log(isSandbox ? '🧪 Usando SANDBOX init point:' : '🚀 Usando PRODUÇÃO init point:', checkoutUrl);
      openMercadoPagoCheckout(checkoutUrl);

    } catch (error: any) {
      console.error('Erro ao criar solicitação:', error);
      Alert.alert('Erro', 'Não foi possível enviar sua solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openMercadoPagoCheckout = async (checkoutUrl: string) => {
    try {
      console.log('🔗 Abrindo checkout Mercado Pago');
      console.log('🌐 URL completa:', checkoutUrl);
      
      // Abrir checkout no browser
      const result = await WebBrowser.openBrowserAsync(checkoutUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        controlsColor: '#10B981',
      });
      
      // Verificar resultado do pagamento
      console.log('💳 Resultado do pagamento:', result);
      
      // Se o pagamento foi concluído, mostrar tela de sucesso
      if (result.type === 'cancel') {
        Alert.alert('Cancelado', 'O pagamento foi cancelado. Você pode tentar novamente.');
      } else {
        // Em produção, verificar se o pagamento foi realmente aprovado
        // Por enquanto, assume sucesso mas em prod deveria verificar status
        Alert.alert(
          'Pagamento Processado!',
          'Seu pagamento está sendo processado. Você receberá uma confirmação em breve.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(student)/agenda')
            }
          ]
        );
      }
      
    } catch (error) {
      console.error('❌ Erro ao abrir checkout:', error);
      Alert.alert('Erro', 'Não foi possível iniciar o pagamento.');
    }
  };

  const showSuccessScreen = () => {
    Alert.alert(
      'Sucesso!',
      'Solicitação enviada! Aguardando aprovação do instrutor.',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/(student)/agenda')
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="text-neutral-500 mt-4">Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!instructor) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-neutral-500">Instrutor não encontrado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalAmount = calculateTotal();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-neutral-100">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-neutral-900">Passo 3 - Confirmar Detalhes</Text>
          <View className="w-6" />
        </View>

        {/* Progresso */}
        <View className="px-6 py-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1">
              <View className="h-2 bg-emerald-500 rounded-full" />
            </View>
            <View className="flex-1 mx-2">
              <View className="h-2 bg-emerald-500 rounded-full" />
            </View>
            <View className="flex-1">
              <View className="h-2 bg-emerald-500 rounded-full" />
            </View>
          </View>
          <Text className="text-neutral-600 text-sm text-center">3 de 3</Text>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Informações do Instrutor */}
          <View className="bg-neutral-50 rounded-xl p-4 mb-6">
            <Text className="text-neutral-900 font-semibold">{instructor.name}</Text>
            <Text className="text-neutral-600 text-sm">{instructor.email}</Text>
          </View>

          {/* Resumo das Aulas */}
          <View className="mb-6">
            <Text className="text-neutral-900 font-semibold mb-3">Resumo das Aulas</Text>
            <View className="space-y-3">
              {selectedTimes.map((time, index) => (
                <View key={`${time.date}-${time.time}`} className="bg-white border border-neutral-200 rounded-xl p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Calendar size={16} color="#10B981" />
                      <Text className="text-neutral-700 font-medium ml-2">
                        {new Date(time.date).toLocaleDateString('pt-BR', { 
                          weekday: 'long',
                          day: '2-digit', 
                          month: '2-digit' 
                        })}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Clock size={16} color="#10B981" />
                      <Text className="text-emerald-600 font-medium ml-2">
                        {time.time}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-neutral-600 text-sm">Duração: 50 minutos</Text>
                    <Text className="text-emerald-600 font-semibold">R$ {instructor?.hourlyRate || 0}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Valores */}
          <View className="bg-emerald-50 rounded-xl p-4 mb-6">
            <Text className="text-emerald-900 font-semibold mb-3">Valores</Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-emerald-700">Aulas ({selectedTimes.length}x)</Text>
                <Text className="text-emerald-700">R$ {instructor?.hourlyRate || 0}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-emerald-700">Subtotal</Text>
                <Text className="text-emerald-700">R$ {totalAmount}</Text>
              </View>
              <View className="border-t border-emerald-200 pt-2 mt-2">
                <View className="flex-row justify-between">
                  <Text className="text-emerald-900 font-semibold">Total</Text>
                  <Text className="text-emerald-900 font-bold text-lg">R$ {totalAmount}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Método de Pagamento */}
          <View className="mb-6">
            <Text className="text-neutral-900 font-semibold mb-3">Método de Pagamento</Text>
            <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <View className="flex-row items-center">
                <DollarSign size={20} color="#3B82F6" />
                <Text className="text-blue-900 font-medium ml-2">Mercado Pago</Text>
                <View className="bg-red-500 px-2 py-1 rounded-full ml-2">
                  <Text className="text-white text-xs font-bold">PRODUÇÃO</Text>
                </View>
              </View>
              <Text className="text-blue-700 text-sm mt-1">
                Pague de forma segura com cartão, pix ou boleto
              </Text>
              <Text className="text-blue-600 text-xs mt-2">
                ⚠️ Pagamento real - será cobrado
              </Text>
            </View>
          </View>

          {/* Termos e Condições */}
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <View className="flex-row items-start">
              <AlertCircle size={20} color="#F59E0B" />
              <View className="ml-3 flex-1">
                <Text className="text-amber-900 font-semibold mb-2">Importante:</Text>
                <Text className="text-amber-700 text-sm">
                  • Pagamento REAL será processado pelo Mercado Pago{'\n'}
                  • Após aprovação, seu cartão será cobrado{'\n'}
                  • O instrutor tem até 24h para aprovar ou recusar{'\n'}
                  • Em caso de recusa, o valor será reembolsado em até 7 dias{'\n'}
                  • Guarde o comprovante para suporte
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Botão Enviar Solicitação */}
        <View className="p-6 border-t border-neutral-100 bg-white">
          <TouchableOpacity 
            className="bg-emerald-500 rounded-xl p-4"
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text className="text-white font-semibold text-lg ml-2">Processando...</Text>
              </View>
            ) : (
              <View className="flex-row items-center justify-center">
                <DollarSign size={20} color="#FFFFFF" />
                <Text className="text-white font-semibold text-lg ml-2">
                  PAGAR AGORA - R$ {totalAmount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
