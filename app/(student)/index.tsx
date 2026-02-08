import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GraduationCap, Car, Clock, Calendar, CheckCircle, CreditCard, ShoppingBag } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { studentService, type Lesson } from '@/services/student';

export default function StudentHomeScreen() {
  const { user } = useAuth();
  const [todayLessons, setTodayLessons] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [confirmedUpcoming, setConfirmedUpcoming] = useState(0);
  const [pendingInstructorUpcoming, setPendingInstructorUpcoming] = useState(0);
  const [nextTodayTime, setNextTodayTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getLessonDateTime = (lesson: Lesson) => {
    const date = new Date(lesson.date);
    const time = new Date(lesson.time);
    date.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return date;
  };

  const isSameDay = (a: Date, b: Date) => {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const loadDashboard = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      const [upcoming, past] = await Promise.all([
        studentService.getUpcomingLessons(user.id),
        studentService.getPastLessons(user.id),
      ]);

      const now = new Date();

      const today = upcoming.filter((l) => isSameDay(getLessonDateTime(l), now));
      const todaySorted = [...today].sort(
        (a, b) => getLessonDateTime(a).getTime() - getLessonDateTime(b).getTime(),
      );

      setTodayLessons(today.length);
      setNextTodayTime(todaySorted.length > 0 ? formatTime(getLessonDateTime(todaySorted[0])) : null);

      const completed = past.filter((l) => l.status === 'COMPLETED' || l.status === 'EVALUATED');
      setCompletedLessons(completed.length);

      const confirmed = upcoming.filter((l) => l.status === 'CONFIRMED');
      setConfirmedUpcoming(confirmed.length);

      const pendingInstructor = upcoming.filter(
        (l) => l.status === 'WAITING_APPROVAL' || l.status === 'REQUESTED' || l.status === 'ADJUSTMENT_PENDING',
      );
      setPendingInstructorUpcoming(pendingInstructor.length);
    } catch {
      setTodayLessons(0);
      setCompletedLessons(0);
      setConfirmedUpcoming(0);
      setPendingInstructorUpcoming(0);
      setNextTodayTime(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useFocusEffect(
    React.useCallback(() => {
      void loadDashboard();
      return undefined;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]),
  );
  
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          <Text className="text-neutral-900 text-2xl font-bold mb-2">
            Olá, {user?.name || 'Aluno'}!
          </Text>
          <Text className="text-neutral-500 text-base mb-1">
            {today.charAt(0).toUpperCase() + today.slice(1)}
          </Text>
          
          {/* Dashboard Cards */}
          <View className="flex-row space-x-3 mb-6">
            <View className="flex-1 bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
              <View className="flex-row items-center mb-2">
                <Calendar size={20} color="#10B981" />
                <Text className="text-emerald-700 text-sm font-semibold ml-2">Aulas Hoje</Text>
              </View>
              <Text className="text-emerald-900 text-2xl font-bold">
                {isLoading ? '...' : todayLessons}
              </Text>
              <Text className="text-emerald-600 text-xs mt-1">
                {todayLessons > 0 && nextTodayTime ? `Próxima: ${nextTodayTime}` : 'Nenhuma hoje'}
              </Text>
            </View>
            
            <View className="flex-1 bg-blue-50 rounded-2xl p-4 border border-blue-200">
              <View className="flex-row items-center mb-2">
                <CheckCircle size={20} color="#3B82F6" />
                <Text className="text-blue-700 text-sm font-semibold ml-2">Concluídas</Text>
              </View>
              <Text className="text-blue-900 text-2xl font-bold">
                {isLoading ? '...' : completedLessons}
              </Text>
              <Text className="text-blue-600 text-xs mt-1">
                {completedLessons > 0 ? 'Este mês' : 'Nenhuma ainda'}
              </Text>
            </View>
          </View>

          <Text className="text-neutral-900 text-lg font-semibold mb-4">
            Menu de Navegação
          </Text>

          <View className="grid grid-cols-2 gap-4 mb-6">
            <TouchableOpacity 
              className="bg-white rounded-2xl p-4 shadow-sm active:scale-95 transition-transform"
              onPress={() => router.push('/schedule')}
            >
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-emerald-100 items-center justify-center mb-3">
                  <Car size={24} color="#10B981" />
                </View>
                <Text className="text-neutral-900 font-semibold text-center">Agendar Aula</Text>
                <Text className="text-neutral-500 text-xs text-center mt-1">Encontre instrutor</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white rounded-2xl p-4 shadow-sm active:scale-95 transition-transform"
              onPress={() => router.push('/agenda')}
            >
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mb-3 relative">
                  <Clock size={24} color="#3B82F6" />
                  {!isLoading && (confirmedUpcoming > 0 || pendingInstructorUpcoming > 0) && (
                    <View className="absolute -top-2 -right-2 flex-row space-x-1">
                      {confirmedUpcoming > 0 && (
                        <View className="bg-red-500 rounded-full px-2 py-1 min-w-[24px] items-center justify-center">
                          <Text className="text-white text-[10px] font-bold">{confirmedUpcoming}</Text>
                        </View>
                      )}
                      {pendingInstructorUpcoming > 0 && (
                        <View className="bg-blue-500 rounded-full px-2 py-1 min-w-[24px] items-center justify-center">
                          <Text className="text-white text-[10px] font-bold">{pendingInstructorUpcoming}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
                <Text className="text-neutral-900 font-semibold text-center">Minha Agenda</Text>
                <Text className="text-neutral-500 text-xs text-center mt-1">
                  {isLoading
                    ? 'Carregando...'
                    : confirmedUpcoming > 0
                      ? `${confirmedUpcoming} aprovada${confirmedUpcoming > 1 ? 's' : ''}`
                      : pendingInstructorUpcoming > 0
                        ? `${pendingInstructorUpcoming} pendente${pendingInstructorUpcoming > 1 ? 's' : ''}`
                        : 'Aulas agendadas'
                  }
                </Text>

                {!isLoading && (confirmedUpcoming > 0 || pendingInstructorUpcoming > 0) && (
                  <View className="flex-row flex-wrap justify-center mt-2">
                    {confirmedUpcoming > 0 && (
                      <View className="bg-red-50 border border-red-200 rounded-full px-2 py-1 mr-2 mb-2">
                        <Text className="text-red-700 text-[10px] font-semibold">Aprovadas</Text>
                      </View>
                    )}
                    {pendingInstructorUpcoming > 0 && (
                      <View className="bg-blue-50 border border-blue-200 rounded-full px-2 py-1 mb-2">
                        <Text className="text-blue-700 text-[10px] font-semibold">Pendentes</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white rounded-2xl p-4 shadow-sm active:scale-95 transition-transform"
              onPress={() => router.push('/payments')}
            >
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center mb-3">
                  <CreditCard size={24} color="#9333EA" />
                </View>
                <Text className="text-neutral-900 font-semibold text-center">Meus Pagamentos</Text>
                <Text className="text-neutral-500 text-xs text-center mt-1">Histórico</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white rounded-2xl p-4 shadow-sm active:scale-95 transition-transform"
              onPress={() => router.push('/services')}
            >
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center mb-3">
                  <ShoppingBag size={24} color="#F97316" />
                </View>
                <Text className="text-neutral-900 font-semibold text-center">Hub de Serviços</Text>
                <Text className="text-neutral-500 text-xs text-center mt-1">Descontos</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 mb-6">
            <View className="flex-row items-center mb-4">
              <GraduationCap size={24} color="#FFFFFF" />
              <Text className="text-white text-lg font-semibold ml-2">
                Seu Progresso
              </Text>
            </View>
            <Text className="text-black text-sm font-medium text-center">
              Continue praticando para conquistar sua habilitação!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
