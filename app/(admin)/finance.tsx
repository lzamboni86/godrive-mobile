import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react-native';
import { adminService } from '@/services/admin';

interface PaymentRequest {
  id: string;
  lessonId: string;
  instructorName: string;
  studentName: string;
  lessonDate: string;
  lessonTime: string;
  originalAmount: number;
  commissionFee: number; // 12%
  finalAmount: number;
  status: 'pending' | 'paid' | 'invoiced';
  createdAt: string;
  rating?: number;
}

export default function AdminFinanceScreen() {
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalPending: 0,
    totalPaid: 0,
    totalRevenue: 0,
    monthRevenue: 0
  });

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const [financeStats, financeHistory, financialReport] = await Promise.all([
        adminService.getFinanceStats(),
        adminService.getFinanceHistory(),
        adminService.getFinancialReport({
          startDate: new Date(new Date().getFullYear(), 0, 1).toISOString(),
          endDate: new Date().toISOString(),
        }),
      ]);

      const isPaymentReceivedStatus = (status: string) => {
        const s = String(status || '').toUpperCase();
        return s === 'PAID' || s === 'RELEASED';
      };

      const totalRevenue = financialReport.transactions
        .filter((t) => isPaymentReceivedStatus(t.status))
        .reduce((sum, t) => {
          const afterMP = t.amount * 0.9;
          const appCommission = afterMP * 0.12;
          return sum + appCommission;
        }, 0);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthRevenue = financialReport.transactions
        .filter((t) => {
          const date = new Date(t.createdAt);
          return isPaymentReceivedStatus(t.status) && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, t) => {
          const afterMP = t.amount * 0.9;
          const appCommission = afterMP * 0.12;
          return sum + appCommission;
        }, 0);

      setStats({
        totalPending: financeStats.pendingCount,
        totalPaid: financeStats.paidCount,
        totalRevenue,
        monthRevenue,
      });

      const parseAmount = (value: unknown) => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          const n = Number(value);
          return Number.isFinite(n) ? n : 0;
        }
        return 0;
      };

      const paymentHistory = (financeHistory || []).map((lesson) => {
        const grossAmount = Math.max(0, parseAmount(lesson.payment?.amount) || parseAmount(lesson.instructor?.hourlyRate));
        const payoutAmount = grossAmount * 0.78;
        const feeAmount = grossAmount - payoutAmount;

        const lessonDateRaw = String(lesson.lessonDate || '');
        const datePart = lessonDateRaw.includes('T') ? lessonDateRaw.split('T')[0] : lessonDateRaw.slice(0, 10);

        const lessonTimeRaw = String(lesson.lessonTime || '');
        const timePart = lessonTimeRaw.includes('T') ? (lessonTimeRaw.split('T')[1] || '') : lessonTimeRaw;
        const timeMatch = timePart.match(/(\d{2}:\d{2})/);

        return {
          id: lesson.id,
          lessonId: lesson.id,
          instructorName: lesson.instructor?.user?.name || lesson.instructor?.user?.email || 'Instrutor',
          studentName: lesson.student?.name || lesson.student?.email || 'Aluno',
          lessonDate: datePart || lessonDateRaw,
          lessonTime: timeMatch ? timeMatch[1] : '--:--',
          originalAmount: grossAmount,
          commissionFee: feeAmount,
          finalAmount: payoutAmount,
          status: 'paid' as const,
          createdAt: lesson.payoutProcessedAt || lessonDateRaw,
        };
      });

      setPayments(paymentHistory);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      setStats({
        totalPending: 0,
        totalPaid: 0,
        totalRevenue: 0,
        monthRevenue: 0
      });
      setPayments([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPayments();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'paid': return 'text-green-600 bg-green-50 border-green-200';
      case 'invoiced': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'paid': return 'Pago';
      case 'invoiced': return 'Faturado';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50">
        <View className="flex-1 items-center justify-center">
          <Text className="text-neutral-500">Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-6">
          <Text className="text-neutral-900 text-2xl font-bold mb-2">
            Financeiro
          </Text>
          <Text className="text-neutral-500 text-base mb-6">
            Gerencie pagamentos aos instrutores
          </Text>

          {/* Stats Cards */}
          <View className="grid grid-cols-2 gap-4 mb-6">
            <View className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
              <View className="flex-row items-center mb-2">
                <Clock size={20} color="#F59E0B" />
                <Text className="text-amber-700 text-sm font-semibold ml-2">Pendentes</Text>
              </View>
              <Text className="text-amber-900 text-2xl font-bold">{stats.totalPending}</Text>
              <Text className="text-amber-600 text-xs">Aguardando pagamento</Text>
            </View>
            
            <View className="bg-green-50 rounded-2xl p-4 border border-green-200">
              <View className="flex-row items-center mb-2">
                <CheckCircle size={20} color="#10B981" />
                <Text className="text-green-700 text-sm font-semibold ml-2">Pagos</Text>
              </View>
              <Text className="text-green-900 text-2xl font-bold">{stats.totalPaid}</Text>
              <Text className="text-green-600 text-xs">Processados</Text>
            </View>
            
            <View className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
              <View className="flex-row items-center mb-2">
                <TrendingUp size={20} color="#3B82F6" />
                <Text className="text-blue-700 text-sm font-semibold ml-2">Receita</Text>
              </View>
              <Text className="text-blue-900 text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</Text>
              <Text className="text-blue-600 text-xs">Total</Text>
            </View>
            
            <View className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
              <View className="flex-row items-center mb-2">
                <Calendar size={20} color="#8B5CF6" />
                <Text className="text-purple-700 text-sm font-semibold ml-2">Mês</Text>
              </View>
              <Text className="text-purple-900 text-2xl font-bold">R$ {stats.monthRevenue.toFixed(2)}</Text>
              <Text className="text-purple-600 text-xs">Este mês</Text>
            </View>
          </View>

          <View className="bg-white rounded-2xl shadow-sm">
            <View className="p-4 border-b border-neutral-100">
              <Text className="text-neutral-900 font-semibold">Histórico de Pagamentos</Text>
            </View>

            {payments.length === 0 ? (
              <View className="items-center py-12">
                <AlertCircle size={48} color="#9CA3AF" />
                <Text className="text-neutral-400 mt-4">Nenhum pagamento realizado</Text>
              </View>
            ) : (
              <View className="divide-y divide-neutral-100">
                {payments.map((payment) => (
                  <View key={payment.id} className="p-4">
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <Text className="text-neutral-900 font-medium">Aula #{payment.lessonId}</Text>
                        <Text className="text-neutral-500 text-sm">
                          {payment.instructorName} → {payment.studentName}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Calendar size={12} color="#9CA3AF" />
                          <Text className="text-neutral-400 text-xs ml-1">
                            {formatDate(payment.lessonDate)} às {payment.lessonTime}
                          </Text>
                        </View>
                      </View>
                      <View className={`px-2 py-1 rounded-full border ${getStatusColor(payment.status)}`}>
                        <Text className="text-xs font-medium">{getStatusText(payment.status)}</Text>
                      </View>
                    </View>

                    <View className="bg-neutral-50 rounded-xl p-3">
                      <View className="flex-row justify-between items-center">
                        <View>
                          <Text className="text-neutral-500 text-xs">Valor da Aula</Text>
                          <Text className="text-neutral-900 font-semibold">R$ {payment.originalAmount.toFixed(2)}</Text>
                        </View>
                        <View className="text-center">
                          <Text className="text-neutral-500 text-xs">Taxas (22%)</Text>
                          <Text className="text-red-600 font-semibold">-R$ {payment.commissionFee.toFixed(2)}</Text>
                        </View>
                        <View className="text-right">
                          <Text className="text-neutral-500 text-xs">Pago ao Instrutor (78%)</Text>
                          <Text className="text-green-600 font-bold">R$ {payment.finalAmount.toFixed(2)}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
