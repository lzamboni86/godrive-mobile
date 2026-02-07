import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, User } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

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
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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
                          {new Date(lesson.lessonDate).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </Text>
                        <Text className="text-neutral-500 text-sm">
                          {lesson.lessonTime}
                        </Text>
                      </View>
                    </View>
                    <View className="bg-emerald-100 px-3 py-1 rounded-full">
                      <Text className="text-emerald-700 text-xs font-medium">
                        Confirmada
                      </Text>
                    </View>
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
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
