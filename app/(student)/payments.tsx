import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CreditCard, TrendingUp, TrendingDown, Calendar, AlertCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { studentService, Payment } from '@/services/student';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentPaymentsScreen() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState({
    totalPaid: 0,
    totalLessons: 0,
    pendingPayments: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadPayments();
      return undefined;
    }, [user?.id])
  );

  const loadPayments = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const [paymentsData, summaryData] = await Promise.all([
        studentService.getStudentPayments(user.id),
        studentService.getPaymentSummary(user.id)
      ]);
      setPayments(paymentsData);
      setSummary(summaryData);
    } catch (err: any) {
      setError('Não foi possível carregar seus pagamentos. Tente novamente.');
      console.error('Erro ao carregar pagamentos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPaymentDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'emerald';
      case 'PENDING': return 'amber';
      case 'CANCELLED': return 'red';
      default: return 'neutral';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID': return 'Pago';
      case 'PENDING': return 'Pendente';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-neutral-100">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-neutral-900">Meus Pagamentos</Text>
          <View className="w-6" />
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Loading State */}
          {isLoading && (
            <View className="flex-1 items-center justify-center py-8">
              <ActivityIndicator size="large" color="#10B981" />
              <Text className="text-neutral-500 mt-4">Carregando seus pagamentos...</Text>
            </View>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <View className="flex-row items-start">
                <AlertCircle size={20} color="#EF4444" />
                <View className="ml-3 flex-1">
                  <Text className="text-red-900 font-semibold">Erro</Text>
                  <Text className="text-red-700 text-sm mt-1">{error}</Text>
                  <TouchableOpacity 
                    className="mt-3"
                    onPress={loadPayments}
                  >
                    <Text className="text-red-600 text-sm font-medium">Tentar novamente</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Dados Reais */}
          {!isLoading && !error && (
            <>
              {/* Resumo */}
              <View className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 mb-6">
                <Text className="text-white text-lg font-semibold mb-4">Resumo Financeiro</Text>
                <View className="grid grid-cols-2 gap-4">
                  <View>
                    <Text className="text-white text-sm opacity-90">Total Pago</Text>
                    <Text className="text-white text-2xl font-bold">R$ {summary.totalPaid.toFixed(2)}</Text>
                  </View>
                  <View>
                    <Text className="text-white text-sm opacity-90">Aulas Realizadas</Text>
                    <Text className="text-white text-2xl font-bold">{summary.totalLessons}</Text>
                  </View>
                </View>
                {summary.pendingPayments > 0 && (
                  <View className="mt-4 pt-4 border-t border-emerald-400">
                    <Text className="text-white text-sm opacity-90">Pagamentos Pendentes</Text>
                    <Text className="text-white text-lg font-semibold">R$ {summary.pendingPayments.toFixed(2)}</Text>
                  </View>
                )}
              </View>

              {/* Filtros */}
              <View className="flex-row gap-2 mb-6">
                <TouchableOpacity className="px-4 py-2 bg-emerald-500 rounded-full">
                  <Text className="text-white text-sm font-medium">Todos</Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-4 py-2 bg-neutral-100 rounded-full">
                  <Text className="text-neutral-700 text-sm font-medium">Este Mês</Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-4 py-2 bg-neutral-100 rounded-full">
                  <Text className="text-neutral-700 text-sm font-medium">Pendentes</Text>
                </TouchableOpacity>
              </View>

              {/* Histórico de Pagamentos Real */}
              <View className="space-y-3">
                {payments.length === 0 ? (
                  <View className="bg-neutral-50 rounded-xl p-6 text-center">
                    <Text className="text-neutral-500">Você não tem pagamentos registrados.</Text>
                  </View>
                ) : (
                  payments.map((payment) => {
                    const color = getStatusColor(payment.status);
                    return (
                      <View key={payment.id} className="bg-white border border-neutral-200 rounded-xl p-4">
                        <View className="flex-row items-start justify-between mb-2">
                          <View className="flex-1">
                            <Text className="text-neutral-900 font-semibold">{payment.description}</Text>
                            <Text className="text-neutral-600 text-sm">
                              {payment.status === 'PAID' 
                                ? `Pago em ${formatPaymentDate(payment.paymentDate || payment.createdAt)}`
                                : payment.paymentDate 
                                  ? `Pago em ${formatPaymentDate(payment.paymentDate)}`
                                  : 'Aguardando pagamento'
                              }
                            </Text>
                          </View>
                          <View className={`bg-${color}-100 px-2 py-1 rounded-full`}>
                            <Text className={`text-${color}-700 text-xs font-medium`}>
                              {getStatusText(payment.status)}
                            </Text>
                          </View>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center text-neutral-500 text-sm">
                            <Calendar size={14} color="#9CA3AF" />
                            <Text className="ml-1">{formatPaymentDate(payment.createdAt)}</Text>
                          </View>
                          <Text className={`text-${color}-600 font-semibold`}>
                            R$ {payment.amount.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
