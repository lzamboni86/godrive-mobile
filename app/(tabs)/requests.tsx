import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

interface LessonRequest {
  id: string;
  studentId: string;
  student: {
    name?: string;
    email?: string;
    user?: {
      name?: string;
      email?: string;
    };
  };
  lessonDate: string;
  lessonTime: string;
  proposedLessonDate?: string | null;
  proposedLessonTime?: string | null;
  status: 'REQUESTED' | 'WAITING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'ADJUSTMENT_PENDING';
  payment: {
    amount: number;
    status: string;
  };
}

export default function RequestsScreen() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LessonRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const formatTime = (timeString: string) => {
  try {
    // Se for um ISO string, extrair apenas o tempo
    if (timeString.includes('T')) {
      const timePart = timeString.split('T')[1]?.split('Z')[0] || '00:00:00';
      const [hours, minutes] = timePart.split(':');
      return `${hours}:${minutes}`;
    }
    
    // Se for apenas tempo, retornar direto
    return timeString.substring(0, 5);
  } catch (error) {
    console.error('Erro ao formatar horário:', error);
    return timeString;
  }
};

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(dateString);
    const time = new Date(timeString);
    date.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const loadRequests = async () => {
    try {
      setIsLoading(true);

      if (!user?.instructorId) {
        setRequests([]);
        return;
      }
      
      console.log('🔍 Buscando solicitações para Instructor ID:', user.instructorId);

      const response = await api.get(`/instructor/${user.instructorId}/requests`);
      console.log('📋 Resposta requests:', JSON.stringify(response, null, 2));
      
      // Verificar estrutura antes de setar
      if (Array.isArray(response)) {
        console.log('📋 Primeiro item:', JSON.stringify(response[0], null, 2));
        setRequests(response);
      } else {
        console.error('❌ Resposta não é um array:', response);
        setRequests([]);
      }
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
      Alert.alert('Erro', 'Não foi possível carregar as solicitações.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    Alert.alert(
      'Aprovar Aula',
      'Deseja aprovar esta aula? O horário será bloqueado para outros alunos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprovar',
          style: 'default',
          onPress: async () => {
            setProcessingId(requestId);
            try {
              await api.patch(`/instructor/requests/${requestId}/approve`);
              
              setRequests(prev => 
                prev.map(req => 
                  req.id === requestId 
                    ? { ...req, status: 'APPROVED' as const }
                    : req
                )
              );
              
              // Forçar atualização do hook de pending requests
              // Simplesmente recarregar a página de solicitações
              setTimeout(() => {
                loadRequests();
              }, 1000);
              
              Alert.alert('Sucesso', 'Aula aprovada com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível aprovar a aula.');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleApproveAdjustment = async (requestId: string) => {
    Alert.alert(
      'Aprovar Alteração',
      'Deseja aprovar a alteração de data/horário para esta aula? A data oficial será atualizada.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprovar',
          style: 'default',
          onPress: async () => {
            setProcessingId(requestId);
            try {
              await api.patch(`/instructor/requests/${requestId}/approve-adjustment`);
              setTimeout(() => loadRequests(), 500);
              Alert.alert('Sucesso', 'Alteração aprovada com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível aprovar a alteração.');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleRejectAdjustment = async (requestId: string) => {
    Alert.alert(
      'Recusar Alteração',
      'Deseja recusar a alteração? A aula manterá a data original e o aluno será notificado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Recusar',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(requestId);
            try {
              await api.patch(`/instructor/requests/${requestId}/reject-adjustment`);
              setTimeout(() => loadRequests(), 500);
              Alert.alert('Sucesso', 'Alteração recusada.');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível recusar a alteração.');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleReject = async (requestId: string) => {
    Alert.alert(
      'Recusar Aula',
      'Deseja recusar esta aula? O pagamento será reembolsado ao aluno.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Recusar',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(requestId);
            try {
              await api.patch(`/instructor/requests/${requestId}/reject`);
              
              setRequests(prev => 
                prev.map(req => 
                  req.id === requestId 
                    ? { ...req, status: 'REJECTED' as const }
                    : req
                )
              );
              
              Alert.alert('Sucesso', 'Aula recusada e pagamento reembolsado.');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível recusar a aula.');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="text-neutral-500 mt-4">Carregando solicitações...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 pt-8 border-b border-neutral-100">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-neutral-900">Solicitações de Aula</Text>
        <View className="w-6" />
      </View>

      <View className="flex-1">
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {requests.length === 0 ? (
            <View className="flex-1 items-center justify-center py-8">
              <Calendar size={48} color="#D1D5DB" />
              <Text className="text-neutral-500 text-base mt-3 text-center">
                Nenhuma solicitação no momento
              </Text>
            </View>
          ) : (
            <View className="space-y-4">
              {requests.map((request) => (
                <View key={request.id} className="bg-white border border-neutral-200 rounded-2xl p-4">
                  {/* Cabeçalho */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                        <User size={20} color="#3B82F6" />
                      </View>
                      <View>
                        <Text className="text-neutral-900 font-semibold">
                          {request.student?.name || request.student?.user?.name || 'Nome não disponível'}
                        </Text>
                        <Text className="text-neutral-500 text-sm">
                          {request.student?.email || request.student?.user?.email || 'Email não disponível'}
                        </Text>
                      </View>
                    </View>
                    <View className={`px-3 py-1 rounded-full ${
                      request.status === 'WAITING_APPROVAL' || request.status === 'REQUESTED'
                        ? 'bg-amber-100' 
                        : request.status === 'ADJUSTMENT_PENDING'
                          ? 'bg-blue-100'
                        : request.status === 'APPROVED'
                          ? 'bg-emerald-100'
                          : 'bg-red-100'
                    }`}>
                      <Text className={`text-xs font-medium ${
                        request.status === 'WAITING_APPROVAL' || request.status === 'REQUESTED'
                          ? 'text-amber-700' 
                        : request.status === 'ADJUSTMENT_PENDING'
                          ? 'text-blue-700'
                        : request.status === 'APPROVED'
                          ? 'text-emerald-700'
                          : 'text-red-700'
                      }`}>
                        {request.status === 'WAITING_APPROVAL' || request.status === 'REQUESTED'
                          ? 'Aguardando' 
                          : request.status === 'ADJUSTMENT_PENDING'
                            ? 'Alteração'
                          : request.status === 'APPROVED'
                            ? 'Aprovada'
                            : 'Recusada'
                        }
                      </Text>
                    </View>
                  </View>

                  {/* Detalhes da Aula */}
                  <View className="bg-neutral-50 rounded-xl p-3 mb-3">
                    <View className="flex-row items-center mb-2">
                      <Calendar size={16} color="#6B7280" />
                      <Text className="text-neutral-700 text-sm ml-2">
                        {new Date(request.lessonDate).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Clock size={16} color="#6B7280" />
                      <Text className="text-neutral-700 text-sm ml-2">
                        {formatTime(request.lessonTime)}
                      </Text>
                    </View>
                  </View>

                  {request.status === 'ADJUSTMENT_PENDING' && request.proposedLessonDate && request.proposedLessonTime && (
                    <View className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
                      <Text className="text-blue-900 font-semibold mb-2">Solicitação de Alteração</Text>
                      <Text className="text-blue-700 text-sm">
                        Data antiga: {formatDateTime(request.lessonDate, request.lessonTime)}
                      </Text>
                      <Text className="text-blue-700 text-sm mt-1">
                        Nova proposta: {formatDateTime(request.proposedLessonDate, request.proposedLessonTime)}
                      </Text>
                    </View>
                  )}

                  {/* Pagamento */}
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-neutral-600 text-sm">Valor da aula:</Text>
                    <Text className="text-emerald-600 font-semibold">R$ {request.payment.amount}</Text>
                  </View>

                  {/* Ações */}
                  {request.status === 'WAITING_APPROVAL' && (
                    <View className="flex-row gap-3">
                      <TouchableOpacity 
                        className="flex-1 bg-emerald-500 rounded-xl p-3"
                        onPress={() => handleApprove(request.id)}
                        disabled={processingId === request.id}
                      >
                        {processingId === request.id ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <View className="flex-row items-center justify-center">
                            <CheckCircle size={16} color="#FFFFFF" />
                            <Text className="text-white font-medium ml-2">Aprovar</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity 
                        className="flex-1 bg-red-500 rounded-xl p-3"
                        onPress={() => handleReject(request.id)}
                        disabled={processingId === request.id}
                      >
                        {processingId === request.id ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <View className="flex-row items-center justify-center">
                            <XCircle size={16} color="#FFFFFF" />
                            <Text className="text-white font-medium ml-2">Recusar</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {request.status === 'ADJUSTMENT_PENDING' && (
                    <View className="flex-row gap-3">
                      <TouchableOpacity 
                        className="flex-1 bg-emerald-500 rounded-xl p-3"
                        onPress={() => handleApproveAdjustment(request.id)}
                        disabled={processingId === request.id}
                      >
                        {processingId === request.id ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <View className="flex-row items-center justify-center">
                            <CheckCircle size={16} color="#FFFFFF" />
                            <Text className="text-white font-medium ml-2">Aprovar Alteração</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity 
                        className="flex-1 bg-red-500 rounded-xl p-3"
                        onPress={() => handleRejectAdjustment(request.id)}
                        disabled={processingId === request.id}
                      >
                        {processingId === request.id ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <View className="flex-row items-center justify-center">
                            <XCircle size={16} color="#FFFFFF" />
                            <Text className="text-white font-medium ml-2">Recusar Alteração</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
