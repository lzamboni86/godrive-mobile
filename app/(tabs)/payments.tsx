import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, DollarSign, TrendingUp, Calendar, Clock, CheckCircle } from 'lucide-react-native';
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

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const [paymentsData, summaryData] = await Promise.all([
        api.get<Payment[]>(`/instructor/${user?.id}/payments`),
        api.get(`/instructor/${user?.id}/payments/summary`)
      ]);
      
      setPayments(paymentsData);
      setSummary(summaryData as any);
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
      case 'HELD': return 'Retido para pagamento';
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
                <Text className="text-amber-700 text-xs">Retido para pagamento</Text>
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
                          {getStatusText(payment.status)}
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
                          {formatDateToBrazilianFull(payment.lesson.lessonDate)}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Clock size={16} color="#6B7280" />
                        <Text className="text-neutral-700 text-sm ml-2">
                          {payment.lesson.lessonTime}
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
                            ? `Pago em ${formatDateToBrazilianFull(payment.paidAt)}`
                            : payment.releasedAt 
                              ? `Liberado em ${formatDateToBrazilianFull(payment.releasedAt)}`
                              : `Criado em ${formatDateToBrazilianFull(payment.createdAt)}`
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
