import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock, ChevronRight } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { studentService } from '@/services/student';

const AVAILABLE_TIMES = [
  '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
];

export default function ScheduleAdjustScreen() {
  const { lessonId, date, time, instructorName } = useLocalSearchParams<{ lessonId: string; date?: string; time?: string; instructorName?: string }>();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const monthNames = useMemo(
    () => ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    [],
  );
  const weekDays = useMemo(() => ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'], []);

  const getDaysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (d: Date) => {
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const isDateSelectable = (d: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(d);
    selected.setHours(0, 0, 0, 0);
    return selected >= today;
  };

  const formatDateForDisplay = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const d = new Date(Date.UTC(year, month - 1, day));
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    });
  };

  const handleDatePress = (day: number) => {
    const selected = new Date(Date.UTC(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    if (!isDateSelectable(selected)) return;

    const year = selected.getUTCFullYear();
    const month = String(selected.getUTCMonth() + 1).padStart(2, '0');
    const dayStr = String(selected.getUTCDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${dayStr}`;

    setSelectedDate(dateString);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    let currentWeekDays: any[] = [];
    const calendarRows: any[] = [];

    for (let i = 0; i < firstDay; i++) {
      currentWeekDays.push(<View key={`empty-${i}`} className="flex-1 h-12" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelectable = isDateSelectable(d);

      const iso = new Date(Date.UTC(currentMonth.getFullYear(), currentMonth.getMonth(), day))
        .toISOString()
        .split('T')[0];
      const isSelected = selectedDate === iso;

      currentWeekDays.push(
        <TouchableOpacity
          key={day}
          className={`flex-1 h-12 rounded-lg items-center justify-center ${
            isSelected ? 'bg-emerald-500' : isSelectable ? 'bg-neutral-100' : 'bg-neutral-50 opacity-50'
          }`}
          onPress={() => handleDatePress(day)}
          disabled={!isSelectable}
        >
          <Text
            className={`text-sm font-medium ${
              isSelected ? 'text-white' : isSelectable ? 'text-neutral-900' : 'text-neutral-400'
            }`}
          >
            {day}
          </Text>
        </TouchableOpacity>,
      );

      if (currentWeekDays.length === 7) {
        calendarRows.push(
          <View key={`row-${calendarRows.length}`} className="flex-row mb-1">
            {currentWeekDays}
          </View>,
        );
        currentWeekDays = [];
      }
    }

    if (currentWeekDays.length > 0) {
      while (currentWeekDays.length < 7) {
        currentWeekDays.push(<View key={`empty-end-${currentWeekDays.length}`} className="flex-1 h-12" />);
      }
      calendarRows.push(
        <View key={`row-${calendarRows.length}`} className="flex-row mb-1">
          {currentWeekDays}
        </View>,
      );
    }

    return calendarRows;
  };

  const submitAdjustment = async () => {
    if (!lessonId) {
      Alert.alert('Erro', 'Aula não encontrada.');
      return;
    }

    if (!selectedDate || !selectedTime) {
      Alert.alert('Aviso', 'Selecione uma nova data e um novo horário.');
      return;
    }

    try {
      setIsSubmitting(true);
      await studentService.requestLessonAdjustment(lessonId, {
        proposedDate: selectedDate,
        proposedTime: selectedTime,
      });

      Alert.alert(
        'Solicitação enviada',
        'Seu pedido de alteração foi enviado ao instrutor. Aguarde a resposta.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (error: any) {
      Alert.alert('Erro', error?.response?.data?.message || 'Não foi possível solicitar o ajuste.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between p-4 border-b border-neutral-100">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-neutral-900">Alterar agendamento</Text>
          <View className="w-6" />
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          <View className="bg-neutral-50 rounded-xl p-4 my-6">
            <Text className="text-neutral-900 font-semibold">{instructorName || 'Instrutor'}</Text>
            <Text className="text-neutral-600 text-sm mt-1">
              Aula atual: {date ? new Date(date).toLocaleDateString('pt-BR') : '-'} {time ? `• ${new Date(time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : ''}
            </Text>
          </View>

          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
              <ChevronRight size={24} color="#374151" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-neutral-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
              <ChevronRight size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <View className="flex-row mb-2">
              {weekDays.map((d) => (
                <View key={d} className="flex-1">
                  <Text className="text-xs font-medium text-center text-neutral-600">{d}</Text>
                </View>
              ))}
            </View>
            <View className="flex-col">{renderCalendar()}</View>
          </View>

          <View className="mb-6">
            <Text className="text-neutral-900 font-semibold mb-3">Horários</Text>
            {!selectedDate ? (
              <View className="bg-neutral-50 rounded-xl p-4">
                <Text className="text-neutral-600">Selecione uma data para ver os horários.</Text>
              </View>
            ) : (
              <>
                <View className="bg-neutral-50 rounded-xl p-3 mb-3">
                  <View className="flex-row items-center">
                    <Calendar size={16} color="#6B7280" />
                    <Text className="text-neutral-700 text-sm ml-2">
                      {formatDateForDisplay(selectedDate)}
                    </Text>
                  </View>
                </View>

                <View className="grid grid-cols-4 gap-3">
                  {AVAILABLE_TIMES.map((t) => {
                    const isSelected = selectedTime === t;
                    return (
                      <TouchableOpacity
                        key={t}
                        className={`p-3 rounded-xl items-center justify-center ${isSelected ? 'bg-emerald-500' : 'bg-neutral-100'}`}
                        onPress={() => setSelectedTime(t)}
                      >
                        <Clock size={16} color={isSelected ? '#FFFFFF' : '#6B7280'} />
                        <Text className={`text-sm font-medium mt-1 ${isSelected ? 'text-white' : 'text-neutral-900'}`}>{t}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        </ScrollView>

        <View className="p-6 border-t border-neutral-100 bg-white">
          <TouchableOpacity
            className={`rounded-xl p-4 ${selectedDate && selectedTime ? 'bg-emerald-500' : 'bg-neutral-300'}`}
            onPress={submitAdjustment}
            disabled={!selectedDate || !selectedTime || isSubmitting}
          >
            {isSubmitting ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text className="text-white font-semibold text-lg ml-2">Enviando...</Text>
              </View>
            ) : (
              <Text className={`text-center font-semibold text-lg ${selectedDate && selectedTime ? 'text-white' : 'text-neutral-500'}`}>
                Solicitar ajuste no agendamento
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
