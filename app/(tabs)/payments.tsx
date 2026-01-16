import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, DollarSign, TrendingUp, Calendar, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

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
  status: 'HELD' | 'RELEASED' | 'REFUNDED';
  releasedAt?: string;
  createdAt: string;
}

export default function PaymentsScreen() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState({
    totalReleased: 0,
    totalHeld: 0,
    totalRefunded: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      case 'REFUNDED': return 'text-red-600 bg-red-100';
      default: return 'text-neutral-600 bg-neutral-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'RELEASED': return 'Disponível';
      case 'HELD': return 'Retido';
      case 'REFUNDED': return 'Reembolsado';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-neutral-500">Carregando pagamentos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-neutral-100">
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
                <Text className="text-emerald-700 text-xs">Disponível</Text>
              </View>
              
              <View className="bg-amber-50 rounded-xl p-3">
                <Clock size={20} color="#F59E0B" />
                <Text className="text-amber-900 text-xl font-bold mt-1">
                  R$ {summary.totalHeld.toFixed(2)}
                </Text>
                <Text className="text-amber-700 text-xs">Retido</Text>
              </View>
              
              <View className="bg-red-50 rounded-xl p-3">
                <TrendingUp size={20} color="#EF4444" />
                <Text className="text-red-900 text-xl font-bold mt-1">
                  R$ {summary.totalRefunded.toFixed(2)}
                </Text>
                <Text className="text-red-700 text-xs">Reembolsado</Text>
              </View>
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
                      <View>
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
                              : 'text-red-700'
                        }`}>
                          {getStatusText(payment.status)}
                        </Text>
                      </View>
                    </View>

                    {/* Detalhes */}
                    <View className="bg-neutral-50 rounded-lg p-3 mb-3">
                      <View className="flex-row items-center mb-2">
                        <Calendar size={16} color="#6B7280" />
                        <Text className="text-neutral-700 text-sm ml-2">
                          {new Date(payment.lesson.lessonDate).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Clock size={16} color="#6B7280" />
                        <Text className="text-neutral-700 text-sm ml-2">
                          {new Date(payment.lesson.lessonTime).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </View>
                    </View>

                    {/* Valores */}
                    <View className="flex-row items-center justify-between">
                      <Text className="text-neutral-600 text-sm">
                        {payment.releasedAt 
                          ? `Liberado em ${new Date(payment.releasedAt).toLocaleDateString('pt-BR')}`
                          : `Criado em ${new Date(payment.createdAt).toLocaleDateString('pt-BR')}`
                        }
                      </Text>
                      <Text className="text-emerald-600 font-bold text-lg">
                        R$ {payment.amount}
                      </Text>
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
