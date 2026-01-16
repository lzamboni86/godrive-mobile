import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, MapPin, Phone, Mail, Calendar, Clock, Car, Award, Users } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { studentService, Instructor } from '@/services/student';

export default function InstructorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleSchedulePress = () => {
    if (instructor) {
      router.push({
        pathname: '/schedule/step-1/[id]' as any,
        params: { id: instructor.id }
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="text-neutral-500 mt-4">Carregando perfil...</Text>
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
          <Text className="text-lg font-semibold text-neutral-900">Perfil do Instrutor</Text>
          <View className="w-6" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Foto e Informações Básicas */}
          <View className="bg-gradient-to-b from-emerald-500 to-emerald-600 px-6 pt-6 pb-8">
            <View className="items-center">
              <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4">
                <Text className="text-emerald-600 text-3xl font-bold">
                  {instructor.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              
              <Text className="text-white text-2xl font-bold mb-2">{instructor.name}</Text>
              
              <View className="flex-row items-center mb-4">
                <Star size={20} color="#FFFFFF" fill="#FFFFFF" />
                <Text className="text-white font-semibold ml-1">4.8</Text>
                <Text className="text-emerald-100 ml-2">(125 aulas ministradas)</Text>
              </View>

              <View className="flex-row gap-4">
                <View className="bg-white/20 px-3 py-1 rounded-full">
                  <Text className="text-white text-sm font-medium">APROVADO</Text>
                </View>
                {instructor.cnh && (
                  <View className="bg-white/20 px-3 py-1 rounded-full">
                    <Text className="text-white text-sm font-medium">CNH {instructor.cnh}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Informações Detalhadas */}
          <View className="px-6 py-6">
            {/* Biografia */}
            <View className="mb-6">
              <Text className="text-neutral-900 font-semibold text-lg mb-3">Sobre</Text>
              <Text className="text-neutral-600 leading-relaxed">
                Instrutor experiente com mais de 5 anos de prática em formação de condutores. 
                Especializado em condução defensiva e preparação para exames práticos. 
                Paciente e dedicado, foco total no sucesso dos alunos.
              </Text>
            </View>

            {/* Veículo */}
            {instructor.vehicle && (
              <View className="mb-6">
                <Text className="text-neutral-900 font-semibold text-lg mb-3">Veículo</Text>
                <View className="bg-neutral-50 rounded-xl p-4">
                  <View className="flex-row items-center">
                    <Car size={20} color="#10B981" />
                    <View className="ml-3">
                      <Text className="text-neutral-900 font-medium">
                        {instructor.vehicle.make} {instructor.vehicle.model}
                      </Text>
                      <Text className="text-neutral-600 text-sm">
                        Placa: {instructor.vehicle.plate || 'Não informada'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Estatísticas */}
            <View className="mb-6">
              <Text className="text-neutral-900 font-semibold text-lg mb-3">Estatísticas</Text>
              <View className="grid grid-cols-2 gap-4">
                <View className="bg-emerald-50 rounded-xl p-4">
                  <Users size={24} color="#10B981" />
                  <Text className="text-emerald-900 text-2xl font-bold mt-2">125+</Text>
                  <Text className="text-emerald-700 text-sm">Alunos Formados</Text>
                </View>
                <View className="bg-blue-50 rounded-xl p-4">
                  <Award size={24} color="#3B82F6" />
                  <Text className="text-blue-900 text-2xl font-bold mt-2">98%</Text>
                  <Text className="text-blue-700 text-sm">Taxa de Aprovação</Text>
                </View>
              </View>
            </View>

            {/* Contato */}
            <View className="mb-6">
              <Text className="text-neutral-900 font-semibold text-lg mb-3">Contato</Text>
              <View className="space-y-3">
                <View className="flex-row items-center">
                  <Mail size={20} color="#6B7280" />
                  <Text className="text-neutral-600 ml-3">{instructor.email}</Text>
                </View>
                <View className="flex-row items-center">
                  <MapPin size={20} color="#6B7280" />
                  <Text className="text-neutral-600 ml-3">São Paulo, SP</Text>
                </View>
              </View>
            </View>

            {/* Disponibilidade */}
            <View className="mb-8">
              <Text className="text-neutral-900 font-semibold text-lg mb-3">Disponibilidade</Text>
              <View className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <View className="flex-row items-center">
                  <Calendar size={20} color="#10B981" />
                  <Text className="text-emerald-900 font-medium ml-2">Segunda a Sábado</Text>
                </View>
                <Text className="text-emerald-700 text-sm mt-1 ml-7">08:00 - 18:00</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Botão de Agendar */}
        <View className="p-6 border-t border-neutral-100 bg-white">
          <TouchableOpacity 
            className="bg-emerald-500 rounded-xl p-4"
            onPress={handleSchedulePress}
          >
            <Text className="text-white text-center font-semibold text-lg">AGENDAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
