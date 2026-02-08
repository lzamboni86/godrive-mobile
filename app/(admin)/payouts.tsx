import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DollarSign, Calendar, Clock, Send, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react-native';
import { adminService, PayoutLesson, PayoutSummary } from '@/services/admin';

export default function AdminPayoutsScreen() {
  const [summary, setSummary] = useState<PayoutSummary>({ totalPending: 0, totalAmount: 0, lessons: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAll, setProcessingAll] = useState(false);

  useEffect(() => {
    loadPayoutSummary();
  }, []);

  const loadPayoutSummary = async () => {
    try {
      const data = await adminService.getPayoutSummary();
      setSummary(data);
    } catch (error) {
      console.error('Erro ao carregar resumo de payouts:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPayoutSummary();
  };

  const handleAnticipate = async (lessonId: string, instructorName: string) => {
    Alert.alert(
      'Antecipar PIX',
      `Deseja antecipar o pagamento para ${instructorName}? Esta ação ignora a regra dos 5 dias.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Antecipar',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(lessonId);
            try {
              const result = await adminService.anticipatePayout(lessonId);
              if (result.success) {
                Alert.alert('Sucesso', `Payout realizado! Transaction ID: ${result.transactionId}`);
                loadPayoutSummary();
              } else {
                Alert.alert('Erro', result.error || 'Não foi possível processar o payout');
              }
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Não foi possível processar o payout');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleProcessAll = async () => {
    Alert.alert(
      'Processar Todos',
      `Deseja processar todos os ${summary.totalPending} payouts pendentes que já passaram dos 5 dias?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Processar Todos',
          onPress: async () => {
            setProcessingAll(true);
            try {
              const result = await adminService.processAllPayouts();
              Alert.alert(
                'Processamento Concluído',
                `Processados: ${result.processed}\nSucesso: ${result.success}\nFalhas: ${result.failed}`
              );
              loadPayoutSummary();
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Erro ao processar payouts');
            } finally {
              setProcessingAll(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getDaysColor = (days: number) => {
    if (days <= 0) return 'text-green-600';
    if (days <= 2) return 'text-amber-600';
    return 'text-neutral-500';
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="text-neutral-500 mt-4">Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="p-6">
          <Text className="text-neutral-900 text-2xl font-bold mb-2">Saldo a Pagar</Text>
          <Text className="text-neutral-500 text-base mb-6">
            Gerencie os payouts para instrutores
          </Text>

          {/* Summary Cards */}
          <View className="flex-row gap-4 mb-6">
            <View className="flex-1 bg-amber-50 rounded-2xl p-4 border border-amber-200">
              <View className="flex-row items-center mb-2">
                <Clock size={20} color="#F59E0B" />
                <Text className="text-amber-700 text-sm font-semibold ml-2">Pendentes</Text>
              </View>
              <Text className="text-amber-900 text-2xl font-bold">{summary.totalPending}</Text>
              <Text className="text-amber-600 text-xs">Aulas aguardando</Text>
            </View>

            <View className="flex-1 bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
              <View className="flex-row items-center mb-2">
                <DollarSign size={20} color="#10B981" />
                <Text className="text-emerald-700 text-sm font-semibold ml-2">Total</Text>
              </View>
              <Text className="text-emerald-900 text-2xl font-bold">
                R$ {summary.totalAmount.toFixed(2)}
              </Text>
              <Text className="text-emerald-600 text-xs">A ser pago</Text>
            </View>
          </View>

          {/* Process All Button */}
          {summary.lessons.some(l => l.daysUntilPayout <= 0) && (
            <TouchableOpacity
              className="bg-emerald-500 rounded-xl p-4 mb-6 flex-row items-center justify-center"
              onPress={handleProcessAll}
              disabled={processingAll}
            >
              {processingAll ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <RefreshCw size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">Processar Todos Elegíveis</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Lessons List */}
          <View className="bg-white rounded-2xl shadow-sm">
            <View className="p-4 border-b border-neutral-100">
              <Text className="text-neutral-900 font-semibold">Aulas Pendentes de Payout</Text>
            </View>

            {summary.lessons.length === 0 ? (
              <View className="p-8 items-center">
                <CheckCircle size={48} color="#10B981" />
                <Text className="text-neutral-500 mt-4 text-center">
                  Nenhum payout pendente no momento
                </Text>
              </View>
            ) : (
              <View className="divide-y divide-neutral-100">
                {summary.lessons.map((lesson) => (
                  <View key={lesson.id} className="p-4">
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1">
                        <Text className="text-neutral-900 font-medium">{lesson.instructorName}</Text>
                        <Text className="text-neutral-500 text-sm">{lesson.instructorEmail}</Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-emerald-600 font-bold text-lg">
                          R$ {lesson.amount.toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center">
                        <Calendar size={14} color="#9CA3AF" />
                        <Text className="text-neutral-500 text-sm ml-1">
                          Avaliada: {formatDate(lesson.evaluatedAt)}
                        </Text>
                      </View>
                      <Text className={`text-sm font-medium ${getDaysColor(lesson.daysUntilPayout)}`}>
                        {lesson.daysUntilPayout <= 0
                          ? '✓ Elegível para payout'
                          : `${lesson.daysUntilPayout} dias restantes`}
                      </Text>
                    </View>

                    <TouchableOpacity
                      className={`rounded-lg p-3 flex-row items-center justify-center ${
                        lesson.daysUntilPayout <= 0 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      onPress={() => handleAnticipate(lesson.id, lesson.instructorName)}
                      disabled={processingId === lesson.id}
                    >
                      {processingId === lesson.id ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Send size={16} color="white" />
                          <Text className="text-white font-medium ml-2">
                            {lesson.daysUntilPayout <= 0 ? 'Enviar PIX' : 'Antecipar PIX'}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
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
