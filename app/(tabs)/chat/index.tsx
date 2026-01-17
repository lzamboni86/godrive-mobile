import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MessageCircle, Clock, CheckCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';

interface Lesson {
  id: string;
  status: string;
  lessonDate: string;
  lessonTime: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  instructor: {
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  chat?: {
    id: string;
  };
}

export default function ChatListScreen() {
  const { user } = useAuth();
  const [lessons, setLessons] = React.useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      
      let endpoint = '';
      if (user?.role === 'INSTRUCTOR') {
        endpoint = '/lessons/instructor';
      } else if (user?.role === 'STUDENT') {
        endpoint = '/lessons/student';
      } else {
        return;
      }

      const response = await api.get(endpoint) as Lesson[];
      const lessonsWithChat = response.filter((lesson: Lesson) => 
        lesson.status === 'CONFIRMED' || 
        lesson.status === 'IN_PROGRESS' || 
        lesson.status === 'COMPLETED'
      );
      
      setLessons(lessonsWithChat);
    } catch (error) {
      console.error('Erro ao carregar chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle size={16} color="#10B981" />;
      case 'IN_PROGRESS':
        return <Clock size={16} color="#F59E0B" />;
      case 'COMPLETED':
        return <CheckCircle size={16} color="#6B7280" />;
      default:
        return <Clock size={16} color="#9CA3AF" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmada';
      case 'IN_PROGRESS':
        return 'Em andamento';
      case 'COMPLETED':
        return 'Finalizada';
      default:
        return status;
    }
  };

  const getOtherParticipant = (lesson: Lesson) => {
    if (user?.role === 'INSTRUCTOR') {
      return lesson.student;
    } else {
      return lesson.instructor.user;
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-neutral-500">Carregando conversas...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 py-4 border-b border-neutral-200">
        <Text className="text-2xl font-bold text-neutral-900">Conversas</Text>
        <Text className="text-sm text-neutral-500 mt-1">
          {user?.role === 'INSTRUCTOR' ? 'Suas conversas com alunos' : 'Suas conversas com instrutores'}
        </Text>
      </View>

      {lessons.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <MessageCircle size={48} color="#9CA3AF" />
          <Text className="text-neutral-500 text-center mt-4">
            Nenhuma conversa encontrada.{'\n'}
            As conversas aparecem quando uma aula é confirmada.
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          {lessons.map((lesson) => {
            const otherParticipant = getOtherParticipant(lesson);
            
            return (
              <TouchableOpacity
                key={lesson.id}
                onPress={() => router.push({ pathname: '/chat/[lessonId]' as any, params: { lessonId: lesson.id } })}
                className="border-b border-neutral-100 px-6 py-4 active:bg-neutral-50"
              >
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-brand-primary rounded-full items-center justify-center mr-4">
                    <Text className="text-white font-bold text-lg">
                      {otherParticipant.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="font-semibold text-neutral-900 flex-1">
                        {otherParticipant.name}
                      </Text>
                      <View className="flex-row items-center">
                        {getStatusIcon(lesson.status)}
                        <Text className="text-xs text-neutral-500 ml-1">
                          {getStatusText(lesson.status)}
                        </Text>
                      </View>
                    </View>
                    
                    <Text className="text-sm text-neutral-500 mt-1">
                      {otherParticipant.email}
                    </Text>
                    
                    <Text className="text-xs text-neutral-400 mt-1">
                      {new Date(lesson.lessonDate).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })} às {lesson.lessonTime}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
