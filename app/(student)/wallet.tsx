import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Wallet, CreditCard, Clock, TrendingUp, AlertCircle, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { walletService } from '@/services/wallet';
import { WalletBalance, WalletTransaction, WalletTransactionStatus } from '@/types';

export default function StudentWalletScreen() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<WalletBalance>({
    totalBalance: 0,
    availableBalance: 0,
    lockedBalance: 0,
    usedBalance: 0
  });
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      const [balanceData, transactionsData] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions()
      ]);
      
      setBalance(balanceData);
      setTransactions(transactionsData);
    } catch (error: any) {
      console.error('❌ [WALLET] Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar sua carteira. Tente novamente.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadWalletData();
  };

  const getStatusColor = (status: WalletTransactionStatus) => {
    switch (status) {
      case 'AVAILABLE': return 'text-emerald-600 bg-emerald-100';
      case 'LOCKED': return 'text-amber-600 bg-amber-100';
      case 'USED': return 'text-blue-600 bg-blue-100';
      default: return 'text-neutral-600 bg-neutral-100';
    }
  };

  const getStatusText = (status: WalletTransactionStatus) => {
    switch (status) {
      case 'AVAILABLE': return 'Disponível';
      case 'LOCKED': return 'Bloqueado';
      case 'USED': return 'Utilizado';
      default: return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'MERCADO_PAGO': return 'Mercado Pago';
      case 'STRIPE': return 'Stripe';
      case 'OTHER': return 'Outro';
      default: return method;
    }
  };

  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="text-neutral-500 mt-4">Carregando carteira...</Text>
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
          <Text className="text-lg font-semibold text-neutral-900">Minha Carteira</Text>
          <View className="w-6" />
        </View>

        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          {/* Saldo Total */}
          <View className="p-4">
            <View className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 mb-6">
              <View className="flex-row items-center mb-4">
                <Wallet size={24} color="#FFFFFF" />
                <Text className="text-white text-lg font-semibold ml-2">Saldo Total</Text>
              </View>
              <Text className="text-white text-3xl font-bold mb-2">
                R$ {balance.totalBalance.toFixed(2)}
              </Text>
              <Text className="text-emerald-50 text-sm">
                Saldo disponível + bloqueado em reservas
              </Text>
            </View>

            {/* Detalhes do Saldo */}
            <View className="space-y-3 mb-6">
              <View className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <CreditCard size={20} color="#10B981" />
                    <Text className="text-emerald-900 font-medium ml-2">Saldo Disponível</Text>
                  </View>
                  <Text className="text-emerald-600 font-bold text-lg">
                    R$ {balance.availableBalance.toFixed(2)}
                  </Text>
                </View>
                <Text className="text-emerald-700 text-sm mt-1">
                  {balance.availableBalance > 0 
                    ? 'Pronto para usar em novas reservas' 
                    : 'Adicione créditos para começar'
                  }
                </Text>
              </View>

              {balance.lockedBalance > 0 && (
                <View className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Clock size={20} color="#F59E0B" />
                      <Text className="text-amber-900 font-medium ml-2">Saldo Bloqueado</Text>
                    </View>
                    <Text className="text-amber-600 font-bold text-lg">
                      R$ {balance.lockedBalance.toFixed(2)}
                    </Text>
                  </View>
                  <Text className="text-amber-700 text-sm mt-1">
                    Aguardando confirmação do instrutor
                  </Text>
                </View>
              )}

              {balance.usedBalance > 0 && (
                <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <TrendingUp size={20} color="#3B82F6" />
                      <Text className="text-blue-900 font-medium ml-2">Créditos Utilizados</Text>
                    </View>
                    <Text className="text-blue-600 font-bold text-lg">
                      R$ {balance.usedBalance.toFixed(2)}
                    </Text>
                  </View>
                  <Text className="text-blue-700 text-sm mt-1">
                    Aulas já realizadas
                  </Text>
                </View>
              )}
            </View>

            {/* Botão Adicionar Créditos */}
            <TouchableOpacity 
              className="bg-emerald-500 rounded-xl p-4 mb-6 flex-row items-center justify-center"
              onPress={() => router.push('/(student)/add-credits' as any)}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text className="text-white font-semibold ml-2">Adicionar Créditos</Text>
            </TouchableOpacity>

            {/* Histórico de Transações */}
            <View>
              <Text className="text-neutral-900 text-lg font-semibold mb-3">Histórico de Transações</Text>
              
              {transactions.length === 0 ? (
                <View className="bg-neutral-50 rounded-xl p-6 items-center">
                  <Wallet size={48} color="#D1D5DB" />
                  <Text className="text-neutral-500 text-base mt-3 text-center">
                    Nenhuma transação encontrada
                  </Text>
                </View>
              ) : (
                <View className="space-y-3">
                  {transactions.map((transaction) => (
                    <View key={transaction.id} className="bg-white border border-neutral-200 rounded-xl p-4">
                      {/* Cabeçalho */}
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-1">
                          <Text className="text-neutral-900 font-semibold">
                            {transaction.description || 'Recarga de créditos'}
                          </Text>
                          <Text className="text-neutral-500 text-sm">
                            {getPaymentMethodText(transaction.paymentMethod)}
                          </Text>
                        </View>
                        <View className={`px-3 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                          <Text className={`text-xs font-medium ${
                            transaction.status === 'AVAILABLE' 
                              ? 'text-emerald-700' 
                              : transaction.status === 'LOCKED'
                                ? 'text-amber-700'
                                : 'text-blue-700'
                          }`}>
                            {getStatusText(transaction.status)}
                          </Text>
                        </View>
                      </View>

                      {/* Detalhes */}
                      <View className="flex-row items-center justify-between">
                        <Text className="text-neutral-600 text-sm">
                          {formatTransactionDate(transaction.createdAt)}
                        </Text>
                        <Text className="text-emerald-600 font-bold text-lg">
                          R$ {transaction.amount.toFixed(2)}
                        </Text>
                      </View>

                      {/* Informações adicionais se houver booking */}
                      {transaction.bookingId && (
                        <View className="mt-2 pt-2 border-t border-neutral-100">
                          <Text className="text-neutral-500 text-xs">
                            Reserva: {transaction.bookingId}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
