import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock, ChevronRight } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { studentService, Instructor } from '@/services/student';
import { useAuth } from '@/contexts/AuthContext';

interface ScheduleData {
  instructorId: string;
  selectedDates: string[];
  selectedTimes: { date: string; time: string }[];
}

export default function ScheduleStep1Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [completedLessons, setCompletedLessons] = useState(0);

  useEffect(() => {
    if (id) {
      loadInstructor();
      loadCompletedLessons();
    }
  }, [id, user?.id]);

  const loadCompletedLessons = async () => {
    try {
      if (!user?.id) return;
      
      console.log('📚 [STEP-1] Carregando aulas concluídas para user:', user.id);
      const pastLessons = await studentService.getPastLessons(user.id);
      console.log('📚 [STEP-1] Aulas passadas recebidas:', pastLessons.length);
      
      const completed = pastLessons.filter(lesson => lesson.status === 'COMPLETED').length;
      console.log('📚 [STEP-1] Aulas completas:', completed);
      setCompletedLessons(completed);
    } catch (error) {
      console.error('❌ [STEP-1] Erro ao carregar aulas concluídas:', error);
      // Em caso de erro, assume que é novo aluno (0 aulas completas)
      setCompletedLessons(0);
    }
  };

  const loadInstructor = async () => {
    try {
      setIsLoading(true);
      console.log('👨‍🏫 [STEP-1] Carregando instrutores...');
      const instructors = await studentService.getApprovedInstructors();
      console.log('👨‍🏫 [STEP-1] Instrutores recebidos:', instructors.length);
      const found = instructors.find(i => i.id === id);
      console.log('👨‍🏫 [STEP-1] Instrutor encontrado:', !!found);
      setInstructor(found || null);
    } catch (error: any) {
      console.error('❌ [STEP-1] Erro ao carregar instrutor:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do instrutor. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    // JavaScript getDay() retorna: 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
    // Ajuste para calendário brasileiro começando na Segunda (1=Seg)
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Converte Dom(0) para 6, outros para -1
  };

  // Função para formatar data sem problemas de timezone
  const formatDateForDisplay = (dateString: string) => {
    // dateString está no formato YYYY-MM-DD
    const [year, month, day] = dateString.split('-').map(Number);
    // Criar data usando UTC para evitar timezone issues
    const date = new Date(Date.UTC(year, month - 1, day));
    
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      timeZone: 'UTC' // Forçar timezone UTC
    });
  };

  const isDateSelectable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    // Não permitir datas passadas
    if (selectedDate < today) return false;
    
    return true;
  };

  const handleDatePress = (day: number) => {
    // Criar data usando UTC para evitar timezone issues
    const selectedDate = new Date(Date.UTC(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    
    if (!isDateSelectable(selectedDate)) return;
    
    // Formatar como YYYY-MM-DD sem timezone adjustments
    const year = selectedDate.getUTCFullYear();
    const month = String(selectedDate.getUTCMonth() + 1).padStart(2, '0');
    const dayStr = String(selectedDate.getUTCDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${dayStr}`;
    
    console.log(`📅 Selecionando data: ${dayStr}/${month}/${year} -> ${dateString}`);
    
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
    const minRequired = completedLessons >= 2 ? 1 : 2;
    
    if (selectedDates.length < minRequired) {
      Alert.alert('Aviso', `Selecione pelo menos ${minRequired} ${minRequired === 1 ? 'data' : 'datas'} para continuar.`);
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
    let currentWeekDays: any[] = [];
    const calendarRows: any[] = [];
    
    // Dias vazios antes do primeiro dia do mês
    for (let i = 0; i < firstDay; i++) {
      currentWeekDays.push(<View key={`empty-${i}`} className="flex-1 h-12" />);
    }
    
    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      // Criar string de data manualmente para evitar timezone issues
      const year = currentMonth.getFullYear();
      const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateString = `${year}-${month}-${dayStr}`;
      
      const isSelected = selectedDates.includes(dateString);
      const isSelectable = isDateSelectable(new Date(year, currentMonth.getMonth(), day));
      
      currentWeekDays.push(
        <TouchableOpacity
          key={day}
          className={`flex-1 h-12 rounded-lg items-center justify-center ${
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
      
      // Criar uma linha a cada 7 dias
      if (currentWeekDays.length === 7) {
        calendarRows.push(
          <View key={`row-${calendarRows.length}`} className="flex-row mb-1">
            {currentWeekDays}
          </View>
        );
        currentWeekDays = [];
      }
    }
    
    // Adicionar os dias restantes da última linha
    if (currentWeekDays.length > 0) {
      // Completar a linha com células vazias se necessário
      while (currentWeekDays.length < 7) {
        currentWeekDays.push(<View key={`empty-end-${currentWeekDays.length}`} className="flex-1 h-12" />);
      }
      calendarRows.push(
        <View key={`row-${calendarRows.length}`} className="flex-row mb-1">
          {currentWeekDays}
        </View>
      );
    }
    
    return calendarRows;
  };

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

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
                <View key={day} className="flex-1">
                  <Text className="text-xs font-medium text-center text-neutral-600">
                    {day}
                  </Text>
                </View>
              ))}
            </View>
            
            {/* Dias do mês */}
            <View className="flex-col">
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
                      {formatDateForDisplay(date)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Informações Importantes */}
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <Text className="text-amber-900 font-semibold mb-2">Importante:</Text>
            <Text className="text-amber-700 text-sm mb-3">
              {completedLessons >= 2 
                ? '• Selecione no mínimo 1 aula\n• Máximo 10 datas por solicitação'
                : '• Se esta é sua primeira vez, selecione ao menos 2 aulas para começar. Já completou as obrigatórias? Pode marcar uma por vez!\n• Máximo 10 datas por solicitação'
              }
            </Text>
          </View>

          {/* Como Funciona */}
          <View className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
            <Text className="text-emerald-900 font-bold text-lg mb-3">🚗 Como funciona o seu agendamento no Go Drive</Text>
            <Text className="text-emerald-800 font-medium mb-3">Fazer suas aulas é simples e seguro! Siga este passo a passo:</Text>
            
            <View className="space-y-3 mb-4">
              <View className="flex-row items-start">
                <Text className="text-emerald-600 mr-2">🗓️</Text>
                <View className="flex-1">
                  <Text className="text-emerald-800 font-medium">Escolha e Reserve</Text>
                  <Text className="text-emerald-700 text-sm">Selecione o instrutor, os dias e horários que melhor se encaixam na sua rotina e clique em reservar.</Text>
                </View>
              </View>
              
              <View className="flex-row items-start">
                <Text className="text-emerald-600 mr-2">💳</Text>
                <View className="flex-1">
                  <Text className="text-emerald-800 font-medium">Pagamento Seguro</Text>
                  <Text className="text-emerald-700 text-sm">Realize o pagamento das aulas. O valor fica retido com segurança pela plataforma até que o instrutor confirme a aula.</Text>
                </View>
              </View>
              
              <View className="flex-row items-start">
                <Text className="text-emerald-600 mr-2">👨‍🏫</Text>
                <View className="flex-1">
                  <Text className="text-emerald-800 font-medium">Validação do Instrutor</Text>
                  <Text className="text-emerald-700 text-sm">O instrutor receberá seu pedido e tem um prazo para aprovar ou recusar, baseando-se na disponibilidade dele.</Text>
                </View>
              </View>
            </View>
            
            <Text className="text-emerald-800 font-semibold mb-2">O que acontece depois?</Text>
            
            <View className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3">
              <View className="flex-row items-start">
                <Text className="text-green-600 mr-2">✅</Text>
                <View className="flex-1">
                  <Text className="text-green-800 font-medium">Se o Instrutor Aprovar (Match!):</Text>
                  <Text className="text-green-700 text-sm">Um chat exclusivo será aberto automaticamente entre vocês. Por lá, vocês combinam o local exato de encontro e tiram dúvidas finais.</Text>
                </View>
              </View>
            </View>
            
            <View className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              <View className="flex-row items-start">
                <Text className="text-amber-600 mr-2">❌</Text>
                <View className="flex-1">
                  <Text className="text-amber-800 font-medium">Se o Instrutor Recusar:</Text>
                  <Text className="text-amber-700 text-sm">Não se preocupe! Seu saldo permanece disponível na sua conta do app imediatamente. Você poderá usá-lo para escolher outro instrutor disponível e realizar um novo agendamento sem precisar pagar novamente.</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              className="bg-emerald-500 rounded-xl p-3 mt-4"
              onPress={() => router.push('/(student)/support' as any)}
            >
              <Text className="text-white font-medium text-center">Ainda tenho dúvidas</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Botão Continuar */}
        <View className="p-6 border-t border-neutral-100 bg-white">
          <TouchableOpacity 
            className={`rounded-xl p-4 ${
              selectedDates.length >= (completedLessons >= 2 ? 1 : 2) 
                ? 'bg-emerald-500' 
                : 'bg-neutral-300'
            }`}
            onPress={handleContinue}
            disabled={selectedDates.length < (completedLessons >= 2 ? 1 : 2)}
          >
            <Text className={`text-center font-semibold text-lg ${
              selectedDates.length >= (completedLessons >= 2 ? 1 : 2) 
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
