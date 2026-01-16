import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, ArrowLeft, MapPin, Star, Calendar, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { studentService, Instructor } from '@/services/student';
import { useAuth } from '@/contexts/AuthContext';

export default function ScheduleSearchScreen() {
  const { user } = useAuth();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [filteredInstructors, setFilteredInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    loadInstructors();
  }, []);

  useEffect(() => {
    filterInstructors();
  }, [searchTerm, selectedFilter, instructors]);

  const loadInstructors = async () => {
    try {
      setIsLoading(true);
      const data = await studentService.getApprovedInstructors();
      setInstructors(data);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar os instrutores. Tente novamente.');
      console.error('Erro ao carregar instrutores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterInstructors = () => {
    let filtered = instructors;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(instructor => 
        instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (selectedFilter === 'available') {
      filtered = filtered.filter(instructor => instructor.status === 'APPROVED');
    }

    setFilteredInstructors(filtered);
  };

  const handleInstructorPress = (instructor: Instructor) => {
    router.push({
      pathname: '/schedule/instructor/[id]' as any,
      params: { id: instructor.id }
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="text-neutral-500 mt-4">Carregando instrutores...</Text>
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
          <Text className="text-lg font-semibold text-neutral-900">Agendar Aula</Text>
          <View className="w-6" />
        </View>

        {/* Barra de Busca */}
        <View className="p-4">
          <View className="flex-row items-center bg-neutral-100 rounded-xl px-4 py-3">
            <Search size={20} color="#9CA3AF" />
            <TextInput 
              className="flex-1 ml-3 text-neutral-900"
              placeholder="Buscar instrutor..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Filtros */}
        <View className="px-4 pb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              <TouchableOpacity 
                className={`px-4 py-2 rounded-full ${
                  selectedFilter === 'all' ? 'bg-emerald-500' : 'bg-neutral-100'
                }`}
                onPress={() => setSelectedFilter('all')}
              >
                <Text className={`text-sm font-medium ${
                  selectedFilter === 'all' ? 'text-white' : 'text-neutral-700'
                }`}>
                  Todos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className={`px-4 py-2 rounded-full ${
                  selectedFilter === 'available' ? 'bg-emerald-500' : 'bg-neutral-100'
                }`}
                onPress={() => setSelectedFilter('available')}
              >
                <Text className={`text-sm font-medium ${
                  selectedFilter === 'available' ? 'text-white' : 'text-neutral-700'
                }`}>
                  Disponíveis
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Lista de Instrutores */}
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {filteredInstructors.length === 0 ? (
            <View className="flex-1 items-center justify-center py-8">
              <Text className="text-neutral-500">Nenhum instrutor encontrado.</Text>
            </View>
          ) : (
            <View className="space-y-4 pb-4">
              {filteredInstructors.map((instructor) => (
                <TouchableOpacity
                  key={instructor.id}
                  className="bg-white border border-neutral-200 rounded-2xl p-4"
                  onPress={() => handleInstructorPress(instructor)}
                >
                  <View className="flex-row">
                    <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mr-4">
                      <Text className="text-emerald-600 text-xl font-bold">
                        {instructor.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-neutral-900 font-semibold text-lg">{instructor.name}</Text>
                      <Text className="text-neutral-600 text-sm mb-2">{instructor.email}</Text>
                      
                      <View className="flex-row items-center mb-2">
                        <Star size={16} color="#F59E0B" fill="#F59E0B" />
                        <Text className="text-amber-600 text-sm font-medium ml-1">4.8</Text>
                        <Text className="text-neutral-500 text-sm ml-2">(125 aulas)</Text>
                      </View>

                      {instructor.vehicle && (
                        <View className="flex-row items-center">
                          <View className="bg-blue-100 px-2 py-1 rounded">
                            <Text className="text-blue-700 text-xs font-medium">
                              {instructor.vehicle.make} {instructor.vehicle.model}
                            </Text>
                          </View>
                          {instructor.cnh && (
                            <View className="bg-purple-100 px-2 py-1 rounded ml-2">
                              <Text className="text-purple-700 text-xs font-medium">
                                CNH {instructor.cnh}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-neutral-100">
                    <View className="flex-row items-center text-emerald-600">
                      <Calendar size={16} color="#10B981" />
                      <Text className="ml-1 text-sm font-medium">Disponível</Text>
                    </View>
                    <TouchableOpacity className="bg-emerald-500 px-4 py-2 rounded-full">
                      <Text className="text-white text-sm font-medium">Ver Perfil</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
