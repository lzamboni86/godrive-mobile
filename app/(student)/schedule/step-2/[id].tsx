import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, ChevronRight, Car, MapPin, Star, CheckCircle } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { studentService, Instructor } from '@/services/student';
import { formatDateToBrazilianFull } from '@/utils/dateUtils';

interface ScheduleData {
  instructorId: string;
  selectedDates: string[];
  selectedTimes: { date: string; time: string }[];
}

const AVAILABLE_TIMES = [
  '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
];

export default function ScheduleStep2Screen() {
  const { id, dates } = useLocalSearchParams<{ id: string; dates: string }>();
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const normalizeDateString = (value: string) => {
    if (!value) return '';
    const datePart = value.split('T')[0];
    const parts = datePart.split('-');
    if (parts.length !== 3) return '';
    const [year, month, day] = parts;
    if (!year || !month || !day) return '';
    return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const selectedDatesParam = JSON.parse(dates || '[]');
  const [selectedDates] = useState<string[]>(
    (Array.isArray(selectedDatesParam) ? selectedDatesParam : [])
      .map((d) => normalizeDateString(String(d)))
      .filter(Boolean)
  );
  const [selectedTimes, setSelectedTimes] = useState<{ date: string; time: string }[]>([]);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);

  const formatDateNoTimezone = (dateString: string) => {
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    const [, month, day] = parts;
    return `${day}/${month}`;
  };

  useEffect(() => {
    if (id) {
      loadInstructor();
    }
  }, [id]);

  const loadInstructor = async () => {
    try {
      setIsLoading(true);
      const instructors = await studentService.getApprovedInstructors();
      const found = instructors.find(i => i.id === id);
      setInstructor(found || null);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar os dados do instrutor.');
      console.error('Erro ao carregar instrutor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimePress = (time: string) => {
    const currentDate = selectedDates[currentDateIndex];
    const existingIndex = selectedTimes.findIndex(t => t.date === currentDate && t.time === time);
    
    if (existingIndex >= 0) {
      setSelectedTimes(selectedTimes.filter((_, index) => index !== existingIndex));
    } else {
      setSelectedTimes([...selectedTimes, { date: currentDate, time }]);
    }
  };

  const isTimeSelected = (time: string) => {
    const currentDate = selectedDates[currentDateIndex];
    return selectedTimes.some(t => t.date === currentDate && t.time === time);
  };

  const handleContinue = () => {
    const totalSelected = selectedTimes.length;
    
    if (totalSelected < selectedDates.length) {
      Alert.alert('Aviso', `Selecione pelo menos 1 horário para cada data. Faltam ${selectedDates.length - totalSelected} horários.`);
      return;
    }
    
    if (instructor) {
      router.push({
        pathname: '/schedule/step-3/[id]' as any,
        params: { 
          id: instructor.id,
          dates: JSON.stringify(selectedDates),
          times: JSON.stringify(selectedTimes)
        }
      });
    }
  };

  const renderTimeGrid = () => {
    return (
      <View className="grid grid-cols-4 gap-3">
        {AVAILABLE_TIMES.map((time) => {
          const isSelected = isTimeSelected(time);
          return (
            <TouchableOpacity
              key={time}
              className={`p-3 rounded-xl items-center justify-center ${
                isSelected 
                  ? 'bg-emerald-500' 
                  : 'bg-neutral-100'
              }`}
              onPress={() => handleTimePress(time)}
            >
              <Clock size={16} color={isSelected ? '#FFFFFF' : '#6B7280'} />
              <Text className={`text-sm font-medium mt-1 ${
                isSelected ? 'text-white' : 'text-neutral-900'
              }`}>
                {time}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="text-neutral-500 mt-4">Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!instructor) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-neutral-500">Instrutor não encontrado.</Text>
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
          <Text className="text-lg font-semibold text-neutral-900">Passo 2 - Selecionar Horário</Text>
          <View className="w-6" />
        </View>

        {/* Progresso */}
        <View className="px-6 py-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1">
              <View className="h-2 bg-emerald-500 rounded-full" />
            </View>
            <View className="flex-1 mx-2">
              <View className="h-2 bg-emerald-500 rounded-full" />
            </View>
            <View className="flex-1">
              <View className="h-2 bg-neutral-200 rounded-full" />
            </View>
          </View>
          <Text className="text-neutral-600 text-sm text-center">2 de 3</Text>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Informações do Instrutor */}
          <View className="bg-neutral-50 rounded-xl p-4 mb-6">
            <Text className="text-neutral-900 font-semibold text-lg">{instructor.name}</Text>
            <View className="mt-3 space-y-2">
              {instructor.vehicle && (
                <View className="flex-row items-center">
                  <Car size={16} color="#6B7280" />
                  <Text className="text-neutral-600 text-sm ml-2">
                    {instructor.vehicle.make} {instructor.vehicle.model} ({instructor.vehicle.year}) - {instructor.vehicle.plate}
                  </Text>
                </View>
              )}
              {instructor.vehicle && (
                <View className="flex-row items-center">
                  <Text className="text-neutral-600 text-sm ml-6">
                    {instructor.vehicle.transmission === 'AUTOMATIC' ? 'Automático' : 'Manual'} • {instructor.vehicle.engineType === 'ELECTRIC' ? 'Elétrico' : 'Combustão'}
                  </Text>
                </View>
              )}
              {instructor.neighborhoodTeach && (
                <View className="flex-row items-center">
                  <MapPin size={16} color="#6B7280" />
                  <Text className="text-neutral-600 text-sm ml-2">
                    Atende em: {instructor.neighborhoodTeach}
                    {instructor.city && instructor.state ? `, ${instructor.city}/${instructor.state}` : ''}
                  </Text>
                </View>
              )}
              <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-neutral-200">
                <View className="flex-row items-center">
                  <CheckCircle size={16} color="#10B981" />
                  <Text className="text-emerald-600 text-sm ml-2 font-medium">
                    {instructor.completedLessonsCount || 0} aulas concluídas
                  </Text>
                </View>
                {instructor.rating && (
                  <View className="flex-row items-center">
                    <Star size={16} color="#F59E0B" />
                    <Text className="text-amber-600 text-sm ml-1 font-medium">
                      {instructor.rating.toFixed(1)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Navegação entre Datas */}
          <View className="mb-6">
            <Text className="text-neutral-900 font-semibold mb-3">Selecione os horários para:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {selectedDates.map((date, index) => {
                  const timesForDate = selectedTimes.filter(t => t.date === date);
                  const isCompleted = timesForDate.length > 0;
                  const isCurrent = index === currentDateIndex;
                  
                  return (
                    <TouchableOpacity
                      key={date}
                      className={`px-4 py-2 rounded-xl border-2 ${
                        isCurrent 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : isCompleted 
                            ? 'border-emerald-300 bg-emerald-50' 
                            : 'border-neutral-200 bg-white'
                      }`}
                      onPress={() => setCurrentDateIndex(index)}
                    >
                      <Text className={`text-sm font-medium ${
                        isCurrent 
                          ? 'text-emerald-700' 
                          : isCompleted 
                            ? 'text-emerald-600' 
                            : 'text-neutral-700'
                      }`}>
                        {formatDateNoTimezone(date)}
                      </Text>
                      {isCompleted && (
                        <Text className="text-emerald-600 text-xs mt-1">
                          {timesForDate.length} horário(s)
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Grade de Horários */}
          <View className="mb-6">
            <Text className="text-neutral-900 font-semibold mb-3">
              Horários Disponíveis - {formatDateNoTimezone(selectedDates[currentDateIndex])}
            </Text>
            {renderTimeGrid()}
          </View>

          {/* Horários Selecionados */}
          {selectedTimes.length > 0 && (
            <View className="mb-6">
              <Text className="text-neutral-900 font-semibold mb-3">
                Horários Selecionados ({selectedTimes.length})
              </Text>
              <View className="space-y-2">
                {selectedTimes.map((time, index) => (
                  <View key={`${time.date}-${time.time}`} className="bg-emerald-50 rounded-xl p-3">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Clock size={16} color="#10B981" />
                        <Text className="text-emerald-700 font-medium ml-2">
                          {time.time}
                        </Text>
                      </View>
                      <Text className="text-emerald-600 text-sm">
                        {formatDateToBrazilianFull(time.date)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Informações Importantes */}
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <Text className="text-amber-900 font-semibold mb-2">Importante:</Text>
            <Text className="text-amber-700 text-sm">
              • Selecione pelo menos 1 horário por data{'\n'}• Cada aula tem duração de 50 minutos{'\n'}• Horários sujeitos à disponibilidade do instrutor
            </Text>
          </View>
        </ScrollView>

        {/* Botão Continuar */}
        <View className="p-6 border-t border-neutral-100 bg-white">
          <TouchableOpacity 
            className={`rounded-xl p-4 ${
              selectedTimes.length >= selectedDates.length 
                ? 'bg-emerald-500' 
                : 'bg-neutral-300'
            }`}
            onPress={handleContinue}
            disabled={selectedTimes.length < selectedDates.length}
          >
            <Text className={`text-center font-semibold text-lg ${
              selectedTimes.length >= selectedDates.length 
                ? 'text-white' 
                : 'text-neutral-500'
            }`}>
              Continuar ({selectedTimes.length}/{selectedDates.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
