import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, Calendar, DollarSign, CheckCircle, AlertCircle, Wallet } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { studentService, Instructor } from '@/services/student';
import { useAuth } from '@/contexts/AuthContext';
import { walletService } from '@/services/wallet';
import { WalletBalance } from '@/types';
import { formatDateWithWeekday } from '@/utils/dateUtils';

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
  const [walletBalance, setWalletBalance] = useState<WalletBalance>({
    totalBalance: 0,
    availableBalance: 0,
    lockedBalance: 0,
    usedBalance: 0
  });
  const [selectedDates] = useState<string[]>(JSON.parse(dates || '[]'));
  const [selectedTimes] = useState<{ date: string; time: string }[]>(JSON.parse(times || '[]'));

  useEffect(() => {
    if (id) {
      loadInstructor();
      loadWalletBalance();
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

  const loadWalletBalance = async () => {
    try {
      const balance = await walletService.getBalance();
      setWalletBalance(balance);
    } catch (error: any) {
      console.error('Erro ao carregar saldo:', error);
    }
  };

  const calculateTotal = () => {
    if (!instructor?.hourlyRate) {
      throw new Error('Preço do instrutor não encontrado');
    }
    return selectedTimes.length * instructor.hourlyRate;
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para continuar.');
      return;
    }

    if (!instructor) {
      Alert.alert('Erro', 'Instrutor não encontrado.');
      return;
    }

    const totalAmount = calculateTotal();
    const hasAvailableBalance = walletBalance.availableBalance >= totalAmount;

    try {
      setIsSubmitting(true);
      console.log('🚀 [STEP-3] Iniciando criação de solicitação...');
      console.log('💰 [STEP-3] Total:', totalAmount);
      console.log('💳 [STEP-3] Saldo disponível:', walletBalance.availableBalance);
      console.log('✅ [STEP-3] Tem saldo suficiente:', hasAvailableBalance);

      if (hasAvailableBalance) {
        // Usar créditos disponíveis
        console.log('💳 [STEP-3] Usando créditos disponíveis...');

        // Criar solicitação de agendamento
        const scheduleData = {
          studentId: user.id,
          instructorId: instructor.userId ?? instructor.id,
          lessons: selectedTimes.map(time => ({
            date: time.date,
            time: time.time,
            duration: 50,
            price: instructor.hourlyRate || 0
          })),
          totalAmount,
          status: 'WAITING_APPROVAL',
          paymentMethod: 'WALLET' as const,
        };

        console.log('📦 [STEP-3] Dados enviados:', JSON.stringify(scheduleData, null, 2));
        const response = await studentService.createScheduleRequest(scheduleData);
        
        console.log('✅ [STEP-3] Solicitação criada com créditos:', response);
        
        Alert.alert(
          'Reserva Criada!',
          'Sua reserva foi criada usando seus créditos. Aguarde a confirmação do instrutor.',
          [{ text: 'OK', onPress: () => router.push('/(student)/schedule/success' as any) }]
        );

      } else {
        // Usar Mercado Pago
        console.log('💳 [STEP-3] Usando Mercado Pago...');
        
        // Criar solicitação de agendamento primeiro (sem preferenceId ainda)
        const scheduleData = {
          studentId: user.id,
          instructorId: instructor.userId ?? instructor.id,
          lessons: selectedTimes.map(time => ({
            date: time.date,
            time: time.time,
            duration: 50,
            price: instructor.hourlyRate || 0
          })),
          totalAmount,
          status: 'PENDING_PAYMENT'
        };

        console.log('📦 [STEP-3] Criando agendamento sem pagamento ainda...');
        const response = await studentService.createScheduleRequest(scheduleData);
        
        console.log('📦 [STEP-3] Agendamento criado:', JSON.stringify(response, null, 2));
        
        console.log('💳 [STEP-3] Abrindo checkout in-app (Secure Fields)');

        const formatBrl = (value: number) =>
          value
            .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            .replace(/\u00A0/g, ' ');

        const lessonsCount = Array.isArray(selectedTimes) ? selectedTimes.length : 0;
        const summaryTitle = `${lessonsCount} ${lessonsCount === 1 ? 'Aula' : 'Aulas'} - ${formatBrl(totalAmount)}`;

        router.push({
          pathname: '/(student)/mercado-pago/secure-fields' as any,
          params: {
            amount: String(totalAmount),
            externalReference: String(response?.lessonIds?.join?.(',') || ''),
            summaryTitle,
            summarySubtitle: 'Pagamento seguro',
          },
        });
      }

    } catch (error: any) {
      console.error('❌ [STEP-3] Erro na solicitação:', error);
      Alert.alert(
        'Erro',
        error?.response?.data?.message || 'Não foi possível criar sua reserva. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAvailableBalance = () => {
    return walletBalance.availableBalance >= calculateTotal();
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00BFA5" />
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
  const canUseCredits = walletBalance.availableBalance >= totalAmount;

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
                        {formatDateWithWeekday(time.date)}
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
            <View className={`${canUseCredits ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'} border rounded-xl p-4`}>
              <View className="flex-row items-center">
                {canUseCredits ? (
                  <>
                    <Wallet size={20} color="#10B981" />
                    <Text className="text-emerald-900 font-medium ml-2">Usar Créditos</Text>
                  </>
                ) : (
                  <>
                    <DollarSign size={20} color="#3B82F6" />
                    <Text className="text-blue-900 font-medium ml-2">Mercado Pago</Text>
                    <View className="bg-red-500 px-2 py-1 rounded-full ml-2">
                      <Text className="text-white text-xs font-bold">PRODUÇÃO</Text>
                    </View>
                  </>
                )}
              </View>
              {canUseCredits ? (
                <Text className="text-emerald-700 text-sm mt-1">
                  Seu saldo disponível cobre esta reserva. O valor ficará bloqueado até o instrutor confirmar.
                </Text>
              ) : (
                <Text className="text-blue-700 text-sm mt-1">
                  Pague de forma segura com cartão, pix ou boleto
                </Text>
              )}
            </View>
          </View>

          {/* Termos e Condições */}
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <View className="flex-row items-start">
              <AlertCircle size={20} color="#F59E0B" />
              <View className="ml-3 flex-1">
                <Text className="text-amber-900 font-semibold mb-2">Atenção aos próximos passos:</Text>
                <View className="space-y-2">
                  <View className="flex-row items-start">
                    <CheckCircle size={16} color="#F59E0B" className="mt-0.5 mr-2" />
                    <Text className="text-amber-700 text-sm flex-1">
                      Pagamento processado com segurança via Mercado Pago.
                    </Text>
                  </View>
                  <View className="flex-row items-start">
                    <Clock size={16} color="#F59E0B" className="mt-0.5 mr-2" />
                    <Text className="text-amber-700 text-sm flex-1">
                      O instrutor tem até 24h para aprovar ou recusar o seu pedido.
                    </Text>
                  </View>
                  <View className="flex-row items-start">
                    <Wallet size={16} color="#F59E0B" className="mt-0.5 mr-2" />
                    <Text className="text-amber-700 text-sm flex-1">
                      Em caso de recusa, o valor vira crédito imediato na sua carteira para novos agendamentos.
                    </Text>
                  </View>
                  <View className="flex-row items-start">
                    <CheckCircle size={16} color="#F59E0B" className="mt-0.5 mr-2" />
                    <Text className="text-amber-700 text-sm flex-1">
                      Um chat será aberto automaticamente após a aprovação para combinar o local da aula.
                    </Text>
                  </View>
                </View>
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
                {canUseCredits ? (
                  <Wallet size={20} color="#FFFFFF" />
                ) : (
                  <DollarSign size={20} color="#FFFFFF" />
                )}
                <Text className="text-white font-semibold text-lg ml-2">
                  {canUseCredits ? `USAR CRÉDITOS - R$ ${totalAmount}` : `PAGAR AGORA - R$ ${totalAmount}`}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
