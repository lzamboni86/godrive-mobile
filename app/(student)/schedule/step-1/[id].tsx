import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock, ChevronRight } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { studentService, Instructor } from '@/services/student';

interface ScheduleData {
  instructorId: string;
  selectedDates: string[];
  selectedTimes: { date: string; time: string }[];
}

export default function ScheduleStep1Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateSelectable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    // Não permitir datas passadas
    if (selectedDate < today) return false;
    
    // Não permitir domingos (0 = domingo)
    if (selectedDate.getDay() === 0) return false;
    
    return true;
  };

  const handleDatePress = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (!isDateSelectable(selectedDate)) return;
    
    const dateString = selectedDate.toISOString().split('T')[0];
    
    if (selectedDates.includes(dateString)) {
      setSelectedDates(selectedDates.filter(d => d !== dateString));
    } else {
      if (selectedDates.length < 10) { // Limite de 10 datas
        setSelectedDates([...selectedDates, dateString]);
      } else {
        Alert.alert('Limite', 'Você pode selecionar no máximo 10 datas.');
      }
    }
  };

  const handleContinue = () => {
    if (selectedDates.length < 2) {
      Alert.alert('Aviso', 'Selecione pelo menos 2 datas para continuar.');
      return;
    }
    
    if (instructor) {
      router.push({
        pathname: '/schedule/step-2/[id]' as any,
        params: { 
          id: instructor.id,
          dates: JSON.stringify(selectedDates)
        }
      });
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Dias vazios antes do primeiro dia do mês
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} className="w-14 h-14 mx-1" />);
    }
    
    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];
      const isSelected = selectedDates.includes(dateString);
      const isSelectable = isDateSelectable(date);
      
      days.push(
        <TouchableOpacity
          key={day}
          className={`w-14 h-14 rounded-lg items-center justify-center mx-1 ${
            isSelected 
              ? 'bg-emerald-500' 
              : isSelectable 
                ? 'bg-neutral-100' 
                : 'bg-neutral-50 opacity-50'
          }`}
          onPress={() => handleDatePress(day)}
          disabled={!isSelectable}
        >
          <Text className={`text-sm font-medium ${
            isSelected 
              ? 'text-white' 
              : isSelectable 
                ? 'text-neutral-900' 
                : 'text-neutral-400'
          }`}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

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
          <Text className="text-lg font-semibold text-neutral-900">Selecionar Data</Text>
          <View className="w-6" />
        </View>

        {/* Progresso */}
        <View className="px-6 py-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1">
              <View className="h-2 bg-emerald-500 rounded-full" />
            </View>
            <View className="flex-1 mx-2">
              <View className="h-2 bg-neutral-200 rounded-full" />
            </View>
            <View className="flex-1">
              <View className="h-2 bg-neutral-200 rounded-full" />
            </View>
          </View>
          <Text className="text-neutral-600 text-sm text-center">1 de 3</Text>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Informações do Instrutor */}
          <View className="bg-neutral-50 rounded-xl p-4 mb-6">
            <Text className="text-neutral-900 font-semibold">{instructor.name}</Text>
            <Text className="text-neutral-600 text-sm">{instructor.email}</Text>
          </View>

          {/* Navegação do Mês */}
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity 
              onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            >
              <ChevronRight size={24} color="#374151" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-neutral-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity 
              onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            >
              <ChevronRight size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Calendário */}
          <View className="mb-6">
            {/* Dias da semana */}
            <View className="flex-row mb-2">
              {weekDays.map((day, index) => (
                <View key={day} className="w-14">
                  <Text className={`text-xs font-medium text-center ${
                    index === 0 ? 'text-red-500' : 'text-neutral-600'
                  }`}>
                    {day}
                  </Text>
                </View>
              ))}
            </View>
            
            {/* Dias do mês */}
            <View className="flex-row flex-wrap">
              {renderCalendar()}
            </View>
          </View>

          {/* Datas Selecionadas */}
          {selectedDates.length > 0 && (
            <View className="mb-6">
              <Text className="text-neutral-900 font-semibold mb-3">
                Datas Selecionadas ({selectedDates.length})
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {selectedDates.map((date) => (
                  <View key={date} className="bg-emerald-100 px-3 py-1 rounded-full">
                    <Text className="text-emerald-700 text-sm">
                      {new Date(date).toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: '2-digit' 
                      })}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Informações Importantes */}
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <Text className="text-amber-900 font-semibold mb-2">Importante:</Text>
            <Text className="text-amber-700 text-sm">
              • Selecione no mínimo 2 datas{'\n'}• Domingos não estão disponíveis{'\n'}• Máximo 10 datas por solicitação
            </Text>
          </View>
        </ScrollView>

        {/* Botão Continuar */}
        <View className="p-6 border-t border-neutral-100 bg-white">
          <TouchableOpacity 
            className={`rounded-xl p-4 ${
              selectedDates.length >= 2 
                ? 'bg-emerald-500' 
                : 'bg-neutral-300'
            }`}
            onPress={handleContinue}
            disabled={selectedDates.length < 2}
          >
            <Text className={`text-center font-semibold text-lg ${
              selectedDates.length >= 2 
                ? 'text-white' 
                : 'text-neutral-500'
            }`}>
              Continuar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
