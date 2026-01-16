import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Clock, User, Car, CheckCircle } from 'lucide-react-native';
import { Lesson, LessonStatus } from '@/types';
import { Button } from './ui/Button';

interface LessonCardProps {
  lesson: Lesson;
  onComplete: (lessonId: string) => void;
  isLoading?: boolean;
}

export function LessonCard({ lesson, onComplete, isLoading }: LessonCardProps) {
  const scheduledDate = new Date(lesson.scheduledAt);
  const formattedTime = scheduledDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(lesson.price);

  const statusConfig = {
    [LessonStatus.CONFIRMED]: {
      label: 'Confirmada',
      bgColor: 'bg-primary-100',
      textColor: 'text-primary-700',
    },
    [LessonStatus.IN_PROGRESS]: {
      label: 'Em Andamento',
      bgColor: 'bg-warning-100',
      textColor: 'text-warning-700',
    },
    [LessonStatus.COMPLETED]: {
      label: 'Concluída',
      bgColor: 'bg-success-100',
      textColor: 'text-success-700',
    },
    [LessonStatus.CANCELLED]: {
      label: 'Cancelada',
      bgColor: 'bg-danger-100',
      textColor: 'text-danger-700',
    },
    [LessonStatus.NO_SHOW]: {
      label: 'Não Compareceu',
      bgColor: 'bg-neutral-100',
      textColor: 'text-neutral-700',
    },
    [LessonStatus.PENDING]: {
      label: 'Pendente',
      bgColor: 'bg-neutral-100',
      textColor: 'text-neutral-600',
    },
  };

  const status = statusConfig[lesson.status];
  const canComplete = lesson.status === LessonStatus.CONFIRMED || lesson.status === LessonStatus.IN_PROGRESS;

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center mr-3">
            <User size={24} color="#0A84FF" />
          </View>
          <View>
            <Text className="text-neutral-900 font-semibold text-base">
              {lesson.student?.user?.name || 'Aluno'}
            </Text>
            <View className="flex-row items-center mt-1">
              <Clock size={14} color="#6B7280" />
              <Text className="text-neutral-500 text-sm ml-1">
                {formattedTime} • {lesson.duration} min
              </Text>
            </View>
          </View>
        </View>
        <View className={`px-3 py-1 rounded-full ${status.bgColor}`}>
          <Text className={`text-xs font-medium ${status.textColor}`}>
            {status.label}
          </Text>
        </View>
      </View>

      {lesson.vehicle && (
        <View className="flex-row items-center mb-3 bg-neutral-50 rounded-lg p-2">
          <Car size={16} color="#6B7280" />
          <Text className="text-neutral-600 text-sm ml-2">
            {lesson.vehicle.model} • {lesson.vehicle.plate}
          </Text>
        </View>
      )}

      <View className="flex-row items-center justify-between pt-3 border-t border-neutral-100">
        <Text className="text-neutral-900 font-bold text-lg">{formattedPrice}</Text>
        {canComplete && (
          <Button
            title="Finalizar Aula"
            variant="success"
            size="sm"
            loading={isLoading}
            onPress={() => onComplete(lesson.id)}
            icon={<CheckCircle size={16} color="#FFFFFF" />}
          />
        )}
      </View>
    </View>
  );
}
