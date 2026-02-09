import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet, BookOpen, TrendingUp, Calendar, DollarSign, ShoppingBag, MessageSquare, Settings, User } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BalanceCard } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { Toast, useToast } from '@/components/ui/Toast';
import { LessonCard } from '@/components/LessonCard';
import { lessonsService, paymentsService } from '@/services/lessons';
import { Lesson, LessonStatus, ApiError } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { usePendingRequests } from '@/hooks/usePendingRequests';
import api from '@/services/api';

export default function DashboardScreen() {
  const { user } = useAuth();
  const instructorId = user?.instructorId || '';
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [releasedBalance, setReleasedBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [completingLessonId, setCompletingLessonId] = useState<string | null>(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const { toast, showSuccess, showError, hideToast } = useToast();
  const pendingCount = usePendingRequests();

  const fetchDashboardData = useCallback(async () => {
    try {
      if (!instructorId) {
        setLessons([]);
        setReleasedBalance(0);
        setUnreadMessagesCount(0);
        return;
      }

      const [lessonsData, balanceData] = await Promise.all([
        lessonsService.getConfirmedLessons(instructorId),
        paymentsService.getReleasedBalance(instructorId),
      ]);

      // Buscar contagem total de mensagens não lidas
      try {
        const unreadResponse = await api.get(`/chat/instructor/${instructorId}/unread-count`);
        setUnreadMessagesCount((unreadResponse as any)?.count || 0);
      } catch (error) {
        console.warn('Erro ao buscar contagem de não lidas:', error);
        setUnreadMessagesCount(0);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayLessons = lessonsData.filter((lesson) => {
        const lessonDate = new Date(lesson.scheduledAt);
        lessonDate.setHours(0, 0, 0, 0);
        return lessonDate.getTime() === today.getTime();
      });

      setLessons(todayLessons);
      setReleasedBalance(balanceData);
    } catch (error) {
      const apiError = error as ApiError;
      console.log('Erro ao carregar dados:', apiError.message);
      
      setLessons([
        {
          id: '1',
          studentId: 'student-1',
          student: {
            id: 'student-1',
            userId: 'user-1',
            user: { id: 'user-1', email: 'joao@email.com', name: 'João Silva', role: 'STUDENT' as any, createdAt: '', updatedAt: '' },
            enrollmentDate: '',
            createdAt: '',
            updatedAt: '',
          },
          instructorId: instructorId,
          instructor: {} as any,
          scheduledAt: new Date().toISOString(),
          duration: 50,
          status: LessonStatus.CONFIRMED,
          price: 120,
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '2',
          studentId: 'student-2',
          student: {
            id: 'student-2',
            userId: 'user-2',
            user: { id: 'user-2', email: 'maria@email.com', name: 'Maria Oliveira', role: 'STUDENT' as any, createdAt: '', updatedAt: '' },
            enrollmentDate: '',
            createdAt: '',
            updatedAt: '',
          },
          instructorId: instructorId,
          instructor: {} as any,
          scheduledAt: new Date(Date.now() + 3600000).toISOString(),
          duration: 50,
          status: LessonStatus.CONFIRMED,
          price: 120,
          createdAt: '',
          updatedAt: '',
          vehicle: {
            id: 'v1',
            plate: 'ABC-1234',
            model: 'Onix',
            brand: 'Chevrolet',
            year: 2023,
            color: 'Branco',
            category: 'B',
            isActive: true,
            createdAt: '',
            updatedAt: '',
          },
        },
      ]);
      setReleasedBalance(1850.0);
    }
  }, [instructorId]);

  useEffect(() => {
    fetchDashboardData().finally(() => setIsLoading(false));
  }, [fetchDashboardData]);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
      return undefined;
    }, [fetchDashboardData])
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
  }, [fetchDashboardData]);

  const handleCompleteLesson = async (lessonId: string) => {
    Alert.alert(
      'Finalizar Aula',
      'A aula já foi concluída? Com sua confirmação a aula será enviada para avaliação do aluno, somente após a avaliação (até 2 dias) o processo de pagamento iniciará.',
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

              setLessons((prev) =>
                prev.map((lesson) =>
                  lesson.id === lessonId
                    ? { ...lesson, status: LessonStatus.COMPLETED }
                    : lesson
                )
              );

              const completedLesson = lessons.find((l) => l.id === lessonId);
              if (completedLesson) {
                setReleasedBalance((prev) => prev + completedLesson.price);
              }

              showSuccess('Aula finalizada, processo de avaliação e pagamento iniciados');
            } catch (error) {
              const apiError = error as ApiError;
              showError(apiError.message || 'Erro ao finalizar aula');
            } finally {
              setCompletingLessonId(null);
            }
          },
        },
      ]
    );
  };

  const confirmedLessons = lessons.filter(
    (l) => l.status === LessonStatus.CONFIRMED || l.status === LessonStatus.IN_PROGRESS
  );
  const completedLessons = lessons.filter((l) => l.status === LessonStatus.COMPLETED);

  if (isLoading) {
    return <Loading fullScreen message="Carregando dados..." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top', 'bottom']}>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pt-8"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#0A84FF"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6">
          <Text className="text-neutral-500 text-sm mb-1">Olá, Instrutor</Text>
          <Text className="text-neutral-900 text-2xl font-bold">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </Text>
        </View>

        <BalanceCard
          title="Saldo Liberado"
          value={releasedBalance}
          subtitle="Disponível para saque"
          variant="success"
          icon={<Wallet size={24} color="#FFFFFF" />}
        />

        <View className="flex-row mt-4 mb-6">
          <View className="flex-1 bg-white rounded-xl p-4 mr-2 shadow-sm">
            <View className="flex-row items-center mb-2">
              <BookOpen size={18} color="#0A84FF" />
              <Text className="text-neutral-500 text-xs ml-2">Aulas Hoje</Text>
            </View>
            <Text className="text-neutral-900 text-2xl font-bold">
              {confirmedLessons.length}
            </Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 ml-2 shadow-sm">
            <View className="flex-row items-center mb-2">
              <TrendingUp size={18} color="#34C759" />
              <Text className="text-neutral-500 text-xs ml-2">Concluídas</Text>
            </View>
            <Text className="text-neutral-900 text-2xl font-bold">
              {completedLessons.length}
            </Text>
          </View>
        </View>

        {/* Menu de Navegação */}
        <View className="mb-6">
          <Text className="text-neutral-900 text-lg font-semibold mb-4">Menu de Navegação</Text>
          <View className="grid grid-cols-2 gap-4">
            <TouchableOpacity 
              className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200"
              onPress={() => router.push('/(tabs)/requests' as any)}
            >
              <View className="flex-row justify-between items-start">
                <View className="w-12 h-12 bg-blue-100 rounded-lg items-center justify-center mb-3">
                  <Calendar size={24} color="#3B82F6" />
                </View>
                {pendingCount > 0 && (
                  <View className="bg-blue-500 rounded-full px-2 py-1 min-w-[24px] items-center justify-center">
                    <Text className="text-white text-xs font-bold">{pendingCount}</Text>
                  </View>
                )}
              </View>
              <Text className="text-neutral-900 font-semibold text-sm mb-1">Solicitações de Aula</Text>
              <Text className="text-neutral-500 text-xs">
                {pendingCount > 0 ? `${pendingCount} pendente${pendingCount > 1 ? 's' : ''}` : 'Aprovar aulas pagas'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200"
              onPress={() => router.push('/(tabs)/schedule')}
            >
              <View className="flex-row justify-between items-start">
                <View className="w-12 h-12 bg-emerald-100 rounded-lg items-center justify-center mb-3">
                  <Calendar size={24} color="#10B981" />
                </View>
                {unreadMessagesCount > 0 && (
                  <View className="bg-emerald-500 rounded-full px-2 py-1 min-w-[24px] items-center justify-center">
                    <Text className="text-white text-xs font-bold">
                      {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-neutral-900 font-semibold text-sm mb-1">Minha Agenda</Text>
              <Text className="text-neutral-500 text-xs">
                {unreadMessagesCount > 0 
                  ? `${unreadMessagesCount} mensagem${unreadMessagesCount > 1 ? 's' : ''} não lida${unreadMessagesCount > 1 ? 's' : ''}`
                  : 'Aulas agendadas'
                }
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200"
              onPress={() => router.push('/(tabs)/payments' as any)}
            >
              <View className="w-12 h-12 bg-purple-100 rounded-lg items-center justify-center mb-3">
                <DollarSign size={24} color="#9333EA" />
              </View>
              <Text className="text-neutral-900 font-semibold text-sm mb-1">Pagamentos</Text>
              <Text className="text-neutral-500 text-xs">Pendentes e histórico</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200"
              onPress={() => router.push('/(tabs)/services' as any)}
            >
              <View className="w-12 h-12 bg-orange-100 rounded-lg items-center justify-center mb-3">
                <ShoppingBag size={24} color="#F97316" />
              </View>
              <Text className="text-neutral-900 font-semibold text-sm mb-1">Hub de Serviços</Text>
              <Text className="text-neutral-500 text-xs">Em breve</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-neutral-900 text-lg font-semibold mb-3">
            Aulas do Dia
          </Text>

          {confirmedLessons.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center">
              <BookOpen size={48} color="#D1D5DB" />
              <Text className="text-neutral-400 text-base mt-3 text-center">
                Nenhuma aula confirmada para hoje
              </Text>
            </View>
          ) : (
            confirmedLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onComplete={handleCompleteLesson}
                isLoading={completingLessonId === lesson.id}
              />
            ))
          )}
        </View>

        {completedLessons.length > 0 && (
          <View className="mb-4">
            <Text className="text-neutral-900 text-lg font-semibold mb-3">
              Aulas Concluídas Hoje
            </Text>
            {completedLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onComplete={handleCompleteLesson}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
