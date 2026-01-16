import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GraduationCap, Car, Clock, Calendar, CheckCircle, CreditCard, ShoppingBag, HeadphonesIcon, Search, Settings, MessageCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export default function StudentHomeScreen() {
  const { user } = useAuth();
  const [todayLessons, setTodayLessons] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Para novos alunos, mostrar dados reais (zero aulas)
    // Futuramente: buscar da API quando tivermos endpoints para alunos
    setTodayLessons(0);
    setCompletedLessons(0);
    setIsLoading(false);
  }, []);
  
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
                {todayLessons > 0 ? 'Próxima: 14:00' : 'Nenhuma hoje'}
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
                <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mb-3">
                  <Clock size={24} color="#3B82F6" />
                </View>
                <Text className="text-neutral-900 font-semibold text-center">Minha Agenda</Text>
                <Text className="text-neutral-500 text-xs text-center mt-1">Aulas agendadas</Text>
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
