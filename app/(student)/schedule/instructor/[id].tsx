import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, MapPin, Phone, Mail, Calendar, Clock, Car, Award, Users } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { studentService, Instructor } from '@/services/student';

export default function InstructorProfileScreen() {
  const { id, instructor: instructorParam } = useLocalSearchParams<{ id: string; instructor?: string }>();
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const displayVehicle = useMemo(() => {
    if (!instructor?.vehicle) return null;
    const make = instructor.vehicle.make;
    const model = instructor.vehicle.model;
    const year = instructor.vehicle.year;
    return `${make} ${model}${year ? ` ${year}` : ''}`;
  }, [instructor?.vehicle]);

  const displayTransmission = useMemo(() => {
    if (instructor?.vehicle?.transmission === 'AUTOMATIC') return 'Automático';
    if (instructor?.vehicle?.transmission === 'MANUAL') return 'Manual';
    return '';
  }, [instructor?.vehicle?.transmission]);

  const displayEngine = useMemo(() => {
    if (instructor?.vehicle?.engineType === 'ELECTRIC') return 'Elétrico';
    if (instructor?.vehicle?.engineType === 'COMBUSTION') return 'Combustão';
    return '';
  }, [instructor?.vehicle?.engineType]);

  const displayHeaderLine = useMemo(() => {
    const parts: string[] = [];
    if (displayVehicle) parts.push(displayVehicle);
    if (displayTransmission) parts.push(displayTransmission);
    if (displayEngine) parts.push(displayEngine);
    return parts.join(' | ');
  }, [displayVehicle, displayTransmission, displayEngine]);

  const ratingValue = useMemo(() => {
    const r = typeof instructor?.rating === 'number' ? instructor.rating : 0;
    return r.toFixed(1);
  }, [instructor?.rating]);

  useEffect(() => {
    if (id) {
      if (instructorParam) {
        try {
          const parsed = JSON.parse(instructorParam);
          setInstructor(parsed);
          setIsLoading(false);
          return;
        } catch (e) {
          // ignore
        }
      }
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
        {/* Header com overlay */}
        <View className="relative">
          <View className="flex-row items-center justify-between p-4 absolute top-0 left-0 right-0 z-10">
            <TouchableOpacity onPress={() => router.back()}>
              <View className="w-8 h-8 bg-black/20 rounded-full items-center justify-center">
                <ArrowLeft size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-white">Perfil do Instrutor</Text>
            <View className="w-8" />
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Foto e Informações Básicas */}
            <View className="bg-gradient-to-b from-emerald-500 to-emerald-600 px-6 pt-16 pb-8">
              <View className="items-center">
                <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4">
                  <Text className="text-emerald-600 text-3xl font-bold">
                    {instructor.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                
                <Text className="text-white text-2xl font-bold mb-2">{instructor.name}</Text>

                {displayHeaderLine ? (
                  <Text className="text-emerald-100 text-sm mb-3 text-center">
                    {displayHeaderLine}
                  </Text>
                ) : (
                  <View className="mb-3" />
                )}
                
                <View className="flex-row items-center mb-4">
                  <Star size={20} color="#FFFFFF" fill="#FFFFFF" />
                <Text className="text-white font-semibold ml-1">{ratingValue}</Text>
                <Text className="text-emerald-100 ml-2">({instructor.completedLessonsCount || 0} aulas)</Text>
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
                  <Text className="text-emerald-900 text-2xl font-bold mt-2">{instructor.completedLessonsCount || 0}</Text>
                  <Text className="text-emerald-700 text-sm">Aulas Realizadas</Text>
                </View>
                <View className="bg-blue-50 rounded-xl p-4">
                  <Star size={24} color="#3B82F6" fill="#3B82F6" />
                  <Text className="text-blue-900 text-2xl font-bold mt-2">{ratingValue}</Text>
                  <Text className="text-blue-700 text-sm">Avaliação</Text>
                </View>
              </View>
            </View>

            {/* Sobre */}
            {instructor.bio && (
              <View className="mb-6">
                <Text className="text-neutral-900 font-semibold text-lg mb-3">Sobre</Text>
                <View className="bg-neutral-50 rounded-xl p-4">
                  <Text className="text-neutral-700 leading-relaxed">{instructor.bio}</Text>
                </View>
              </View>
            )}

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
                  <Text className="text-neutral-600 ml-3">
                    {instructor.city && instructor.state ? `${instructor.city}, ${instructor.state}` : 'Localização não informada'}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <MapPin size={20} color="#6B7280" />
                  <Text className="text-neutral-600 ml-3">
                    {instructor.neighborhoodTeach ? `Bairro de Atendimento: ${instructor.neighborhoodTeach}` : 'Bairro de atendimento não informado'}
                  </Text>
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
            <Text className="text-white text-center font-semibold">Agendar Aula</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
