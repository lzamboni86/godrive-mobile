import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, User, MessageCircle, CheckCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { lessonsService, paymentsService } from '@/services/lessons';
import { ApiError } from '@/types';
import { router } from 'expo-router';

interface ScheduledLesson {
  id: string;
  student: {
    name: string;
    email: string;
  };
  lessonDate: string;
  lessonTime: string;
  status: string;
  payment: {
    amount: number;
    status: string;
  };
}

export default function ScheduleScreen() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<ScheduledLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [completingLessonId, setCompletingLessonId] = useState<string | null>(null);

  const formatLessonTime = useCallback((raw?: string) => {
    if (!raw) return '';
    const value = String(raw);
    if (value.includes('T')) {
      const timePart = value.split('T')[1] || '';
      return timePart.slice(0, 5);
    }
    return value.slice(0, 5);
  }, []);

  const formatLessonDate = useCallback((raw?: string) => {
    if (!raw) return '';
    try {
      return new Date(raw).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
      });
    } catch {
      return String(raw);
    }
  }, []);

  const getStatusUi = useCallback((status?: string) => {
    const s = String(status || '').toUpperCase();
    if (s === 'CONFIRMED' || s === 'APPROVED' || s === 'SCHEDULED') {
      return { label: 'Confirmada', bg: 'bg-emerald-100', text: 'text-emerald-700' };
    }
    if (s === 'IN_PROGRESS') {
      return { label: 'Em andamento', bg: 'bg-amber-100', text: 'text-amber-700' };
    }
    if (s === 'COMPLETED' || s === 'EVALUATED') {
      return { label: 'Finalizada', bg: 'bg-neutral-100', text: 'text-neutral-600' };
    }
    if (s === 'CANCELLED' || s === 'REJECTED') {
      return { label: 'Cancelada', bg: 'bg-red-100', text: 'text-red-700' };
    }
    return { label: s || 'Status', bg: 'bg-neutral-100', text: 'text-neutral-600' };
  }, []);

  const canCompleteLesson = useCallback((status?: string) => {
    const s = String(status || '').toUpperCase();
    return s === 'CONFIRMED' || s === 'IN_PROGRESS' || s === 'APPROVED' || s === 'SCHEDULED';
  }, []);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setIsLoading(true);

      if (!user?.instructorId) {
        setLessons([]);
        return;
      }

      console.log('📅 Buscando agenda para Instructor ID:', user.instructorId);
      
      const response = await api.get(`/instructor/${user.instructorId}/schedule`);
      console.log('📅 Resposta agenda:', response);
      
      setLessons(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Erro ao carregar agenda:', error);
      setLessons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadSchedule();
    } finally {
      setIsRefreshing(false);
    }
  }, [user?.instructorId]);

  const handleOpenChat = useCallback((lessonId: string) => {
    router.push({ pathname: '/chat/[lessonId]' as any, params: { lessonId } });
  }, []);

  const handleCompleteLesson = useCallback((lessonId: string) => {
    Alert.alert(
      'Finalizar Aula',
      'Deseja realmente marcar esta aula como concluída? O pagamento será liberado automaticamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'default',
          onPress: async () => {
            setCompletingLessonId(lessonId);
            try {
              await lessonsService.completeLesson(lessonId);
              await paymentsService.releasePayment(lessonId);
              setLessons((prev) => prev.map((l) => (l.id === lessonId ? { ...l, status: 'COMPLETED' } : l)));
              Alert.alert('Sucesso', 'Aula finalizada e pagamento liberado!');
            } catch (e: any) {
              const apiError = e as ApiError;
              Alert.alert('Erro', apiError?.message || 'Erro ao finalizar aula');
            } finally {
              setCompletingLessonId(null);
            }
          },
        },
      ],
    );
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50" edges={['top', 'bottom']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="text-neutral-500 mt-4">Carregando agenda...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top', 'bottom']}>
      <View className="flex-1 p-6 pt-8">
        <View className="mb-6">
          <Text className="text-neutral-900 text-2xl font-bold">Minha Agenda</Text>
          <Text className="text-neutral-500 text-sm mt-1">
            Aulas confirmadas e agendadas
          </Text>
        </View>

        {lessons.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <View className="w-20 h-20 rounded-full bg-emerald-100 items-center justify-center mb-4">
              <Calendar size={40} color="#10B981" />
            </View>
            <Text className="text-neutral-900 text-xl font-semibold text-center mb-2">
              Nenhuma aula agendada
            </Text>
            <Text className="text-neutral-500 text-base text-center">
              Você não tem aulas confirmadas no momento.
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          >
            <View className="space-y-4">
              {lessons.map((lesson) => (
                <View key={lesson.id} className="bg-white border border-neutral-200 rounded-2xl p-4">
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                        <Calendar size={20} color="#10B981" />
                      </View>
                      <View>
                        <Text className="text-neutral-900 font-semibold">
                          {formatLessonDate(lesson.lessonDate)}
                        </Text>
                        <Text className="text-neutral-500 text-sm">
                          {formatLessonTime(lesson.lessonTime)}
                        </Text>
                      </View>
                    </View>
                    {(() => {
                      const st = getStatusUi(lesson.status);
                      return (
                        <View className={`${st.bg} px-3 py-1 rounded-full`}>
                          <Text className={`${st.text} text-xs font-medium`}>{st.label}</Text>
                        </View>
                      );
                    })()}
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <User size={16} color="#6B7280" />
                      <Text className="text-neutral-700 text-sm ml-2">
                        {lesson.student?.name || 'Aluno'}
                      </Text>
                    </View>
                    <Text className="text-emerald-600 font-semibold">
                      R$ {lesson.payment?.amount || 0}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-neutral-100">
                    <TouchableOpacity
                      className="flex-row items-center bg-neutral-100 px-4 py-2 rounded-full"
                      onPress={() => handleOpenChat(lesson.id)}
                    >
                      <MessageCircle size={16} color="#374151" />
                      <Text className="text-neutral-700 text-sm font-medium ml-2">Chat</Text>
                    </TouchableOpacity>

                    {canCompleteLesson(lesson.status) ? (
                      <TouchableOpacity
                        className={`flex-row items-center px-4 py-2 rounded-full ${
                          completingLessonId === lesson.id ? 'bg-emerald-300' : 'bg-emerald-500'
                        }`}
                        onPress={() => handleCompleteLesson(lesson.id)}
                        disabled={completingLessonId === lesson.id}
                      >
                        <CheckCircle size={16} color="#FFFFFF" />
                        <Text className="text-white text-sm font-medium ml-2">
                          {completingLessonId === lesson.id ? 'Finalizando...' : 'Finalizar Aula'}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
