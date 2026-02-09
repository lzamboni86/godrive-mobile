import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle, AlertCircle, MessageCircle, Star } from 'lucide-react-native';
 import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { studentService, Lesson } from '@/services/student';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentAgendaScreen() {
  const { user } = useAuth();
  const [upcomingLessons, setUpcomingLessons] = useState<Lesson[]>([]);
  const [pastLessons, setPastLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLessons();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadLessons();
      return undefined;
    }, [user?.id])
  );

  const loadLessons = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const [upcoming, past] = await Promise.all([
        studentService.getUpcomingLessons(user.id),
        studentService.getPastLessons(user.id)
      ]);
      setUpcomingLessons(upcoming);
      setPastLessons(past);
    } catch (err: any) {
      setError('Não foi possível carregar suas aulas. Tente novamente.');
      console.error('Erro ao carregar aulas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatLessonDate = (dateString: string, timeString?: string) => {
    const date = new Date(dateString);
    
    // Se tiver timeString, usa o horário dela
    if (timeString) {
      const timeDate = new Date(timeString);
      date.setHours(timeDate.getHours(), timeDate.getMinutes(), 0, 0);
    }
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (timeString: string) => {
    // Extract time directly from ISO string to avoid timezone conversion
    if (timeString.includes('T')) {
      return timeString.split('T')[1].slice(0, 5);
    }
    // Fallback for HH:mm format
    return timeString.slice(0, 5);
  };

  const formatDuration = (duration: number) => {
    if (duration >= 60) {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      if (minutes === 0) {
        return `${hours} hora${hours > 1 ? 's' : ''}`;
      }
      return `${hours} hora${hours > 1 ? 's' : ''} e ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    }
    return `${duration} minuto${duration > 1 ? 's' : ''}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'emerald';
      case 'ADJUSTMENT_PENDING': return 'amber';
      case 'SCHEDULED': return 'amber';
      case 'COMPLETED': return 'neutral';
      case 'CANCELLED': return 'red';
      default: return 'neutral';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Aula aceita';
      case 'ADJUSTMENT_PENDING': return 'Ajuste solicitado';
      case 'SCHEDULED': return 'Pendente aceite instrutor';
      case 'WAITING_APPROVAL': return 'Pendente aceite instrutor';
      case 'REQUESTED': return 'Pendente aceite instrutor';
      case 'COMPLETED': return 'Concluída';
      case 'CANCELLED': return 'Cancelada';
      default: return status;
    }
  };

  const getLessonDateTime = (lesson: Lesson) => {
    const date = new Date(lesson.date);
    const time = new Date(lesson.time);
    // Use UTC methods to avoid timezone offset
    date.setUTCHours(time.getUTCHours(), time.getUTCMinutes(), 0, 0);
    return date;
  };

  const canRequestAdjustment = (lesson: Lesson) => {
    if (lesson.status !== 'CONFIRMED') return false;
    const diffMs = getLessonDateTime(lesson).getTime() - Date.now();
    return diffMs > 24 * 60 * 60 * 1000;
  };

  const isWithin24Hours = (lesson: Lesson) => {
    if (lesson.status !== 'CONFIRMED') return false;
    const diffMs = getLessonDateTime(lesson).getTime() - Date.now();
    return diffMs <= 24 * 60 * 60 * 1000;
  };

  const openChat = (lessonId: string) => {
    router.push(`/chat/${lessonId}`);
  };

  const openReview = (lessonId: string) => {
    router.push(`/reviews/${lessonId}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-neutral-100">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-neutral-900">Minha Agenda</Text>
          <View className="w-6" />
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          <Text className="text-neutral-600 mb-6">
            Veja suas aulas agendadas e aulas anteriores
          </Text>

          {/* Loading State */}
          {isLoading && (
            <View className="flex-1 items-center justify-center py-8">
              <ActivityIndicator size="large" color="#10B981" />
              <Text className="text-neutral-500 mt-4">Carregando suas aulas...</Text>
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
                    onPress={loadLessons}
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
              {/* Próximas Aulas */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-neutral-900 mb-4">Próximas Aulas</Text>
                {upcomingLessons.length === 0 ? (
                  <View className="bg-neutral-50 rounded-xl p-6 text-center">
                    <Text className="text-neutral-500">Você não tem aulas agendadas.</Text>
                  </View>
                ) : (
                  <View className="space-y-3">
                    {upcomingLessons.map((lesson) => {
                      const color = getStatusColor(lesson.status);
                      const canAdjust = canRequestAdjustment(lesson);
                      const within24h = isWithin24Hours(lesson);
                      const isPendingInstructorAcceptance =
                        lesson.status === 'WAITING_APPROVAL' ||
                        lesson.status === 'REQUESTED' ||
                        lesson.status === 'SCHEDULED';
                      return (
                        <TouchableOpacity
                          key={lesson.id}
                          onPress={() => lesson.status === 'CONFIRMED' && openChat(lesson.id)}
                          className={`bg-${color}-50 border border-${color}-200 rounded-xl p-4`}
                          disabled={lesson.status !== 'CONFIRMED'}
                        >
                          <View className="flex-row items-start justify-between mb-2">
                            <View className="flex-1">
                              <Text className={`text-${color}-900 font-semibold`}>Aula Prática</Text>
                              <Text className={`text-${color}-700 text-sm`}>
                                {lesson.instructor?.name || 'Instrutor'}
                              </Text>
                            </View>
                            <View className="items-end">
                              <View className={`bg-${color}-500 px-2 py-1 rounded-full mb-1`}>
                                <Text className="text-white text-xs font-medium">
                                  {getStatusText(lesson.status)}
                                </Text>
                              </View>
                              {lesson.status === 'CONFIRMED' && (
                                <TouchableOpacity
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    openChat(lesson.id);
                                  }}
                                  className="flex-row items-center bg-emerald-500 px-3 py-1 rounded-full"
                                >
                                  <MessageCircle size={14} color="white" />
                                  <Text className="text-white text-xs font-medium ml-1">Chat</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                          <View className={`flex-row items-center text-${color}-700 text-sm`}>
                            <Calendar size={16} color={color === 'neutral' ? '#6B7280' : '#10B981'} />
                            <Text className="ml-2">{formatLessonDate(lesson.date, lesson.time)}</Text>
                          </View>
                          <View className={`flex-row items-center text-${color}-700 text-sm mt-1`}>
                            <Clock size={16} color={color === 'neutral' ? '#6B7280' : '#10B981'} />
                            <Text className="ml-2">{formatTime(lesson.time)} - {formatDuration(lesson.duration)} - {lesson.location || 'Local a definir'}</Text>
                          </View>

                          {isPendingInstructorAcceptance && (
                            <View className="mt-3 bg-amber-100 border border-amber-200 rounded-lg px-3 py-2">
                              <Text className="text-amber-800 text-xs font-semibold">Pendente aceite instrutor</Text>
                            </View>
                          )}

                          {lesson.status === 'CONFIRMED' && (
                            <View className="mt-3">
                              <TouchableOpacity
                                className={`rounded-xl py-2 px-3 ${canAdjust ? 'bg-emerald-500' : 'bg-neutral-200'}`}
                                disabled={!canAdjust}
                                onPress={(e) => {
                                  e.stopPropagation();
                                  if (!canAdjust) return;
                                  router.push({
                                    pathname: '/(student)/schedule/adjust/[lessonId]' as any,
                                    params: {
                                      lessonId: lesson.id,
                                      date: lesson.date,
                                      time: lesson.time,
                                      instructorName: lesson.instructor?.name ?? 'Instrutor',
                                    } as any,
                                  });
                                }}
                              >
                                <Text className={`text-center font-semibold ${canAdjust ? 'text-white' : 'text-neutral-500'}`}>
                                  Alterar agendamento
                                </Text>
                              </TouchableOpacity>

                              {within24h && (
                                <Text className="text-amber-700 text-xs font-medium mt-2">
                                  Menos de 24 horas para aula
                                </Text>
                              )}
                            </View>
                          )}
                          {lesson.status === 'CONFIRMED' && (
                            <View className="mt-2 pt-2 border-t border-neutral-200">
                              <Text className="text-xs text-emerald-600 font-medium">
                                Toque para conversar com o instrutor
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Aulas Anteriores */}
              <View>
                <Text className="text-lg font-semibold text-neutral-900 mb-4">Aulas Anteriores</Text>
                {pastLessons.length === 0 ? (
                  <View className="bg-neutral-50 rounded-xl p-6 text-center">
                    <Text className="text-neutral-500">Você não tem aulas anteriores.</Text>
                  </View>
                ) : (
                  <View className="space-y-3">
                    {pastLessons.map((lesson) => {
                      const color = getStatusColor(lesson.status);
                      const isEvaluated = lesson.status === 'EVALUATED';
                      const canReview = lesson.status === 'COMPLETED';
                      return (
                        <View key={lesson.id} className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
                          <View className="flex-row items-start justify-between mb-2">
                            <View>
                              <Text className="text-neutral-900 font-semibold">Aula Prática</Text>
                              <Text className="text-neutral-600 text-sm">
                                {lesson.instructor?.name || 'Instrutor'}
                              </Text>
                            </View>
                            <View className="flex-row items-center">
                              {isEvaluated ? (
                                <>
                                  <CheckCircle size={16} color="#10B981" />
                                  <Text className="text-emerald-600 text-sm font-medium ml-1">Avaliada</Text>
                                </>
                              ) : lesson.status === 'COMPLETED' ? (
                                <>
                                  <CheckCircle size={16} color="#10B981" />
                                  <Text className="text-emerald-600 text-sm font-medium ml-1">Concluída</Text>
                                </>
                              ) : (
                                <>
                                  <XCircle size={16} color="#EF4444" />
                                  <Text className="text-red-600 text-sm font-medium ml-1">Cancelada</Text>
                                </>
                              )}
                            </View>
                          </View>
                          <View className="flex-row items-center text-neutral-600 text-sm">
                            <Calendar size={16} color="#9CA3AF" />
                            <Text className="ml-2">{formatLessonDate(lesson.date, lesson.time)}</Text>
                          </View>
                          <View className="flex-row items-center text-neutral-600 text-sm mt-1">
                            <Clock size={16} color="#9CA3AF" />
                            <Text className="ml-2">{formatTime(lesson.time)} - {formatDuration(lesson.duration)} - {lesson.location || 'Local'}</Text>
                          </View>

                          {canReview && (
                            <TouchableOpacity
                              onPress={() => openReview(lesson.id)}
                              className="mt-3 bg-emerald-500 rounded-xl py-2 px-3 flex-row items-center justify-center"
                            >
                              <Star size={16} color="white" />
                              <Text className="text-white font-medium ml-2">Avaliar instrutor</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
