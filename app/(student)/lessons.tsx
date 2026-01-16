import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, User } from 'lucide-react-native';

export default function LessonsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1">
        <View className="p-6 border-b border-neutral-100">
          <Text className="text-2xl font-bold text-neutral-900">Minhas Aulas</Text>
          <Text className="text-neutral-600 mt-1">Gerencie suas aulas agendadas</Text>
        </View>

        <ScrollView className="flex-1 px-6">
          <View className="py-8">
            <View className="items-center">
              <Calendar size={48} color="#D1D5DB" />
              <Text className="text-neutral-400 text-base mt-4 text-center">
                Nenhuma aula encontrada
              </Text>
              <Text className="text-neutral-400 text-sm mt-2 text-center">
                Suas aulas aparecerão aqui
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}