import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, DollarSign, Calendar, Clock, CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { formatDateToBrazilianFull } from '@/utils/dateUtils';

interface Payment {
  id: string;
  lessonId: string;
  lesson: {
    lessonDate: string;
    lessonTime: string;
    student: {
      user: { name: string; email: string };
    };
  };
  amount: number;
  originalAmount: number;
  status: 'HELD' | 'RELEASED' | 'PAID';
  releasedAt?: string;
  paidAt?: string;
  createdAt: string;
}

interface PaymentSummary {
  totalReleased: number;
  totalHeld: number;
  totalPaid: number;
  platformFee: number;
}

export default function PaymentsScreen() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary>({
    totalReleased: 0,
    totalHeld: 0,
    totalPaid: 0,
    platformFee: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Constante da taxa de gerenciamento da plataforma
  const PLATFORM_FEE_PERCENTAGE = 0.12; // 12%

  // Função para calcular valor líquido após taxa da plataforma
  const calculateNetAmount = (grossAmount: number): number => {
    return grossAmount * (1 - PLATFORM_FEE_PERCENTAGE);
  };

  // Função para calcular valor da taxa
  const calculatePlatformFee = (grossAmount: number): number => {
    return grossAmount * PLATFORM_FEE_PERCENTAGE;
  };

  const formatTimestampDate = (value?: string) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatLessonDate = (value?: string) => {
    if (!value) return '';
    // Se vier ISO, usa parser por Date; se vier YYYY-MM-DD, usa utilitário sem timezone.
    if (value.includes('T')) return formatTimestampDate(value);
    if (value.includes('-')) return formatDateToBrazilianFull(value);
    return value;
  };

  const formatLessonTime = (value?: string) => {
    if (!value) return '';
    // Se vier ISO datetime, extrai hora:minuto.
    if (value.includes('T')) {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    // Se vier HH:mm ou HH:mm:ss, reduz para HH:mm
    const match = value.match(/^\d{2}:\d{2}/);
    return match ? match[0] : value;
  };

  useEffect(() => {
    if (user?.instructorId) {
      loadPayments();
    }
  }, [user?.instructorId]);

  const loadPayments = async () => {
    try {
      if (!user?.instructorId) return;
      setIsLoading(true);
      const [paymentsData, summaryData] = await Promise.all([
        api.get<any[]>(`/instructor/${user.instructorId}/payments`),
        api.get<any>(`/instructor/${user.instructorId}/payments/summary`)
      ]);

      const paymentsPayload = Array.isArray(paymentsData)
        ? paymentsData
        : Array.isArray((paymentsData as any)?.data)
          ? (paymentsData as any).data
          : [];

      const summaryPayload = (summaryData as any)?.data ?? summaryData;

      const normalizedPayments: Payment[] = (paymentsPayload || []).map((p: any) => {
        const grossAmount = Number(p.originalAmount ?? p.amount ?? 0);
        const netAmount = Number(p.amount);

        // Se o backend ainda envia apenas `amount` (formato antigo), tratamos como bruto.
        const computedNet = calculateNetAmount(grossAmount);
        const amountToUse = Number.isFinite(netAmount) && p.originalAmount != null ? netAmount : computedNet;

        // Backend antigo usa REFUNDED; por enquanto mapeamos para PAID ("Já pago") para não quebrar a UI.
        const status = (p.status === 'REFUNDED' ? 'PAID' : p.status) as Payment['status'];

        return {
          id: String(p.id),
          lessonId: String(p.lessonId ?? p.lesson_id ?? ''),
          lesson: {
            lessonDate: String(p.lesson?.lessonDate ?? p.lesson?.lesson_date ?? p.lessonDate ?? ''),
            lessonTime: String(p.lesson?.lessonTime ?? p.lesson?.lesson_time ?? p.lessonTime ?? ''),
            student: {
              user: {
                name: String(p.lesson?.student?.user?.name ?? ''),
                email: String(p.lesson?.student?.user?.email ?? ''),
              },
            },
          },
          originalAmount: grossAmount,
          amount: Number.isFinite(amountToUse) ? amountToUse : computedNet,
          status,
          releasedAt: p.releasedAt ?? p.released_at,
          paidAt: p.paidAt ?? p.paid_at,
          createdAt: p.createdAt ?? p.created_at,
        };
      });

      const platformFeeFromPayments = normalizedPayments.reduce(
        (acc, p) => acc + calculatePlatformFee(p.originalAmount || 0),
        0
      );

      const normalizedSummary: PaymentSummary = {
        totalReleased: Number(summaryPayload?.totalReleased ?? 0),
        totalHeld: Number(summaryPayload?.totalHeld ?? 0),
        totalPaid: Number(summaryPayload?.totalPaid ?? summaryPayload?.totalRefunded ?? 0),
        platformFee: Number(summaryPayload?.platformFee ?? platformFeeFromPayments ?? 0),
      };

      // Se summary vier no formato antigo (sem taxa / totalPaid), calculamos do histórico normalizado.
      const shouldComputeFromPayments =
        summaryPayload == null ||
        summaryPayload.totalPaid == null && summaryPayload.totalRefunded == null && summaryPayload.platformFee == null;

      const computedSummaryFromPayments: PaymentSummary = normalizedPayments.reduce(
        (acc, p) => {
          if (p.status === 'RELEASED') acc.totalReleased += p.amount;
          else if (p.status === 'HELD') acc.totalHeld += p.amount;
          else if (p.status === 'PAID') acc.totalPaid += p.amount;
          acc.platformFee += calculatePlatformFee(p.originalAmount || 0);
          return acc;
        },
        { totalReleased: 0, totalHeld: 0, totalPaid: 0, platformFee: 0 }
      );

      setPayments(normalizedPayments);
      setSummary(shouldComputeFromPayments ? computedSummaryFromPayments : normalizedSummary);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os pagamentos.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadPayments();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RELEASED': return 'text-emerald-600 bg-emerald-100';
      case 'HELD': return 'text-amber-600 bg-amber-100';
      case 'PAID': return 'text-blue-600 bg-blue-100';
      default: return 'text-neutral-600 bg-neutral-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'RELEASED': return 'Disponível e será pago';
      case 'HELD': return 'Retido';
      case 'PAID': return 'Já pago';
      default: return status;
    }
  };

  const getStatusChipText = (status: string) => {
    switch (status) {
      case 'RELEASED': return 'Disponível';
      case 'HELD': return 'Retido';
      case 'PAID': return 'Já pago';
      default: return status;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'RELEASED': return 'Aula concluída, aguardando transferência';
      case 'HELD': return 'Aula aprovada, aguardando realização';
      case 'PAID': return 'Valor transferido para sua conta';
      default: return '';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-neutral-500">Carregando pagamentos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 pt-8 border-b border-neutral-100">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-neutral-900">Pagamentos</Text>
          <View className="w-6" />
        </View>

        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          {/* Resumo Financeiro */}
          <View className="p-4">
            <Text className="text-neutral-900 text-lg font-semibold mb-4">Resumo Financeiro</Text>
            
            <View className="grid grid-cols-3 gap-3 mb-6">
              <View className="bg-emerald-50 rounded-xl p-3">
                <DollarSign size={20} color="#10B981" />
                <Text className="text-emerald-900 text-xl font-bold mt-1">
                  R$ {summary.totalReleased.toFixed(2)}
                </Text>
                <Text className="text-emerald-700 text-xs">Disponível e será pago</Text>
              </View>
              
              <View className="bg-amber-50 rounded-xl p-3">
                <Clock size={20} color="#F59E0B" />
                <Text className="text-amber-900 text-xl font-bold mt-1">
                  R$ {summary.totalHeld.toFixed(2)}
                </Text>
                <Text className="text-amber-700 text-xs">Retido para pagamento após conclusão das aulas agendadas</Text>
              </View>
              
              <View className="bg-blue-50 rounded-xl p-3">
                <CheckCircle size={20} color="#3B82F6" />
                <Text className="text-blue-900 text-xl font-bold mt-1">
                  R$ {summary.totalPaid.toFixed(2)}
                </Text>
                <Text className="text-blue-700 text-xs">Já pago</Text>
              </View>
            </View>

            {/* Taxa da Plataforma */}
            <View className="bg-neutral-50 rounded-xl p-4 mb-6">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-neutral-900 font-semibold">Taxa da Plataforma</Text>
                  <Text className="text-neutral-600 text-sm mt-1">12% sobre o valor das aulas</Text>
                </View>
                <Text className="text-neutral-700 font-bold text-lg">
                  R$ {summary.platformFee.toFixed(2)}
                </Text>
              </View>
              <Text className="text-neutral-500 text-xs mt-2">
                💡 Valores exibidos já descontam a taxa da plataforma
              </Text>
            </View>

            {/* Lista de Pagamentos */}
            <Text className="text-neutral-900 text-lg font-semibold mb-3">Histórico</Text>
            
            {payments.length === 0 ? (
              <View className="bg-neutral-50 rounded-xl p-6 items-center">
                <DollarSign size={48} color="#D1D5DB" />
                <Text className="text-neutral-500 text-base mt-3 text-center">
                  Nenhum pagamento encontrado
                </Text>
              </View>
            ) : (
              <View className="space-y-3">
                {payments.map((payment) => (
                  <View key={payment.id} className="bg-white border border-neutral-200 rounded-xl p-4">
                    {/* Cabeçalho */}
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-neutral-900 font-semibold">
                          {payment.lesson.student.user.name}
                        </Text>
                        <Text className="text-neutral-500 text-sm">
                          {payment.lesson.student.user.email}
                        </Text>
                      </View>
                      <View className={`px-3 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                        <Text className={`text-xs font-medium ${
                          payment.status === 'RELEASED' 
                            ? 'text-emerald-700' 
                            : payment.status === 'HELD'
                              ? 'text-amber-700'
                              : 'text-blue-700'
                        }`}>
                          {getStatusChipText(payment.status)}
                        </Text>
                      </View>
                    </View>

                    {/* Descrição do Status */}
                    <View className="mb-3">
                      <Text className="text-neutral-600 text-xs">
                        {getStatusDescription(payment.status)}
                      </Text>
                    </View>

                    {/* Detalhes */}
                    <View className="bg-neutral-50 rounded-lg p-3 mb-3">
                      <View className="flex-row items-center mb-2">
                        <Calendar size={16} color="#6B7280" />
                        <Text className="text-neutral-700 text-sm ml-2">
                          {formatLessonDate(payment.lesson.lessonDate)}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Clock size={16} color="#6B7280" />
                        <Text className="text-neutral-700 text-sm ml-2">
                          {formatLessonTime(payment.lesson.lessonTime)}
                        </Text>
                      </View>
                    </View>

                    {/* Valores Detalhados */}
                    <View className="space-y-2">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-neutral-600 text-sm">
                          Valor da aula (bruto)
                        </Text>
                        <Text className="text-neutral-700 text-sm">
                          R$ {payment.originalAmount.toFixed(2)}
                        </Text>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-neutral-600 text-sm">
                          Taxa plataforma (12%)
                        </Text>
                        <Text className="text-red-600 text-sm">
                          -R$ {calculatePlatformFee(payment.originalAmount).toFixed(2)}
                        </Text>
                      </View>
                      <View className="flex-row items-center justify-between pt-2 border-t border-neutral-200">
                        <Text className="text-neutral-900 font-semibold text-sm">
                          Valor a receber (líquido)
                        </Text>
                        <Text className="text-emerald-600 font-bold text-lg">
                          R$ {payment.amount.toFixed(2)}
                        </Text>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-neutral-500 text-xs">
                          {payment.paidAt 
                            ? `Pago em ${formatTimestampDate(payment.paidAt)}`
                            : payment.releasedAt 
                              ? `Liberado em ${formatTimestampDate(payment.releasedAt)}`
                              : `Criado em ${formatTimestampDate(payment.createdAt)}`
                          }
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
