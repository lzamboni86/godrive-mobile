import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, Calendar, CheckCircle, AlertTriangle, DollarSign, MessageCircle, Star, FileText } from 'lucide-react-native';
import { adminService } from '@/services/admin';

interface ActivityLog {
  id: string;
  action: string;
  entity: 'lesson' | 'payment' | 'approval' | 'chat' | 'rating' | 'invoice';
  entityName: string;
  timestamp: string;
  details: string;
  status: 'success' | 'pending' | 'error';
  userId?: string;
  userName?: string;
  metadata?: {
    mercadoPagoId?: string;
    mercadoPagoPaymentId?: string;
    mercadoPagoStatus?: string;
    amount?: string;
    approvedAt?: string;
  };
}

export default function AdminLogsScreen() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await adminService.getLogs();
      setLogs(data);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLogs();
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'payment': return <DollarSign size={16} color="#10B981" />;
      case 'lesson': return <Calendar size={16} color="#3B82F6" />;
      case 'approval': return <CheckCircle size={16} color="#10B981" />;
      case 'chat': return <MessageCircle size={16} color="#8B5CF6" />;
      case 'rating': return <Star size={16} color="#F59E0B" />;
      case 'invoice': return <FileText size={16} color="#EF4444" />;
      default: return <Clock size={16} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50">
        <View className="flex-1 items-center justify-center">
          <Text className="text-neutral-500">Carregando logs...</Text>
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
            Logs de Atividade
          </Text>
          <Text className="text-neutral-500 text-base mb-6">
            Acompanhe o fluxo das aulas em tempo real
          </Text>

          {/* Filtros */}
          <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
            <Text className="text-neutral-900 text-sm font-semibold mb-3">Filtrar por:</Text>
            <View className="flex-row flex-wrap gap-2">
              {['Todos', 'Pagamentos', 'Aulas', 'Aprovações', 'Chat', 'Avaliações'].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  className="px-3 py-1 bg-neutral-100 rounded-full"
                >
                  <Text className="text-neutral-700 text-xs">{filter}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Logs List */}
          <View className="space-y-3">
            {logs.map((log) => (
              <View key={log.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-row items-center flex-1">
                    {getEntityIcon(log.entity)}
                    <View className="ml-3 flex-1">
                      <Text className="text-neutral-900 font-medium">{log.action}</Text>
                      <Text className="text-neutral-500 text-sm">{log.entityName}</Text>
                    </View>
                  </View>
                  <View className={`px-2 py-1 rounded-full border ${getStatusColor(log.status)}`}>
                    <Text className="text-xs font-medium capitalize">{log.status}</Text>
                  </View>
                </View>
                
                <Text className="text-neutral-500 text-sm">{log.details}</Text>
                
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Clock size={12} color="#9CA3AF" />
                    <Text className="text-neutral-400 text-xs ml-1">{formatDate(log.timestamp)}</Text>
                  </View>
                  {log.userName && (
                    <Text className="text-neutral-500 text-xs">{log.userName}</Text>
                  )}
                </View>
                
                {/* Mercado Pago Details */}
                {log.metadata && (
                  <View className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                    <Text className="text-amber-700 text-xs font-semibold mb-1">Dados Mercado Pago:</Text>
                    <View className="space-y-1">
                      <Text className="text-amber-600 text-xs">• MP ID: {log.metadata.mercadoPagoId}</Text>
                      <Text className="text-amber-600 text-xs">• Payment ID: {log.metadata.mercadoPagoPaymentId}</Text>
                      <Text className="text-amber-600 text-xs">• Status: {log.metadata.mercadoPagoStatus}</Text>
                      <Text className="text-amber-600 text-xs">• Valor: R${log.metadata.amount}</Text>
                      {log.metadata.approvedAt && (
                        <Text className="text-amber-600 text-xs">• Aprovado em: {new Date(log.metadata.approvedAt).toLocaleString('pt-BR')}</Text>
                      )}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>

          {logs.length === 0 && (
            <View className="items-center py-12">
              <Text className="text-neutral-400">Nenhuma atividade encontrada</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
