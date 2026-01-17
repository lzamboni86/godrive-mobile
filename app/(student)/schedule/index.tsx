import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, ArrowLeft, MapPin, Star, Calendar, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { studentService, Instructor, InstructorSearchFilters } from '@/services/student';
import { useAuth } from '@/contexts/AuthContext';

export default function ScheduleSearchScreen() {
  const { user } = useAuth();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [filteredInstructors, setFilteredInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const STATES = useMemo(() => ['Paraná', 'São Paulo'], []);
  const CITIES = useMemo(() => ['Curitiba', 'Araucária', 'São Paulo'], []);
  const NEIGHBORHOODS = useMemo(() => ['Água Verde', 'Portão', 'Centro'], []);

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [picker, setPicker] = useState<{ title: string; options: { label: string; value: string }[]; onSelect: (v: string) => void } | null>(null);

  const [filterState, setFilterState] = useState<string>('');
  const [filterCity, setFilterCity] = useState<string>('');
  const [filterNeighborhoodTeach, setFilterNeighborhoodTeach] = useState<string>('');
  const [filterGender, setFilterGender] = useState<InstructorSearchFilters['gender'] | ''>('');
  const [filterTransmission, setFilterTransmission] = useState<InstructorSearchFilters['transmission'] | ''>('');
  const [filterEngineType, setFilterEngineType] = useState<InstructorSearchFilters['engineType'] | ''>('');

  const hasRequiredFilters = !!(filterState && filterCity && filterNeighborhoodTeach);

  useEffect(() => {
    setIsLoading(false);
    // Carregar instrutores sem filtros ao iniciar
    loadInstructors();
  }, []);

  useEffect(() => {
    filterInstructors();
  }, [searchTerm, selectedFilter, instructors]);

  const loadInstructors = async () => {
    try {
      setIsLoading(true);

      // Montar filtros apenas com valores preenchidos
      const filters: any = {};
      if (filterState) filters.state = filterState;
      if (filterCity) filters.city = filterCity;
      if (filterNeighborhoodTeach) filters.neighborhoodTeach = filterNeighborhoodTeach;
      if (filterGender) filters.gender = filterGender;
      if (filterTransmission) filters.transmission = filterTransmission;
      if (filterEngineType) filters.engineType = filterEngineType;

      const data = await studentService.getApprovedInstructors(filters);
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
      params: { id: instructor.id, instructor: JSON.stringify(instructor) }
    });
  };

  const openPicker = (title: string, options: { label: string; value: string }[], onSelect: (v: string) => void) => {
    setPicker({ title, options, onSelect });
  };

  const formatRating = (rating?: number) => {
    const r = typeof rating === 'number' ? rating : 0;
    return r.toFixed(1);
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
            <TouchableOpacity
              className="ml-2 w-10 h-10 rounded-full items-center justify-center bg-white"
              onPress={() => setFilterModalOpen(true)}
            >
              <Filter size={18} color="#10B981" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal filtros */}
        <Modal
          visible={filterModalOpen}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setFilterModalOpen(false);
            setPicker(null);
          }}
        >
          <View className="flex-1 bg-black/40 justify-end">
            <View className="bg-white rounded-t-3xl p-5">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-neutral-900 font-semibold text-lg">Filtros</Text>
                <TouchableOpacity
                  onPress={() => {
                    setFilterModalOpen(false);
                    setPicker(null);
                  }}
                >
                  <Text className="text-emerald-600 font-semibold">Fechar</Text>
                </TouchableOpacity>
              </View>

              {/* Filtros de Localização */}
              <Text className="text-neutral-700 font-semibold mb-2">Localização</Text>
              <View className="space-y-2">
                <TouchableOpacity
                  className="bg-neutral-100 rounded-xl p-3"
                  onPress={() =>
                    openPicker(
                      'Estado',
                      [
                        { label: 'Qualquer', value: '' },
                        ...STATES.map((s) => ({ label: s, value: s })),
                      ],
                      (v) => {
                        setFilterState(v);
                        setFilterCity('');
                        setFilterNeighborhoodTeach('');
                        setPicker(null);
                      }
                    )
                  }
                >
                  <Text className="text-neutral-500 text-xs">Estado</Text>
                  <Text className="text-neutral-900 font-medium">{filterState || 'Qualquer'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-neutral-100 rounded-xl p-3"
                  onPress={() =>
                    openPicker(
                      'Cidade',
                      [
                        { label: 'Qualquer', value: '' },
                        ...CITIES.map((c) => ({ label: c, value: c })),
                      ],
                      (v) => {
                        setFilterCity(v);
                        setFilterNeighborhoodTeach('');
                        setPicker(null);
                      }
                    )
                  }
                >
                  <Text className="text-neutral-500 text-xs">Cidade</Text>
                  <Text className="text-neutral-900 font-medium">{filterCity || 'Qualquer'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-neutral-100 rounded-xl p-3"
                  onPress={() =>
                    openPicker(
                      'Bairro de Atendimento',
                      [
                        { label: 'Qualquer', value: '' },
                        ...NEIGHBORHOODS.map((b) => ({ label: b, value: b })),
                      ],
                      (v) => {
                        setFilterNeighborhoodTeach(v);
                        setPicker(null);
                      }
                    )
                  }
                >
                  <Text className="text-neutral-500 text-xs">Bairro de Atendimento</Text>
                  <Text className="text-neutral-900 font-medium">{filterNeighborhoodTeach || 'Qualquer'}</Text>
                </TouchableOpacity>
              </View>

              {/* Preferências */}
              <Text className="text-neutral-700 font-semibold mt-4 mb-2">Preferências</Text>
              <View className="space-y-2">
                <TouchableOpacity
                  className="bg-neutral-100 rounded-xl p-3"
                  onPress={() =>
                    openPicker(
                      'Sexo do Instrutor',
                      [
                        { label: 'Qualquer', value: '' },
                        { label: 'Masculino', value: 'MALE' },
                        { label: 'Feminino', value: 'FEMALE' },
                        { label: 'Outro', value: 'OTHER' },
                      ],
                      (v) => {
                        setFilterGender((v as any) || '');
                        setPicker(null);
                      }
                    )
                  }
                >
                  <Text className="text-neutral-500 text-xs">Sexo</Text>
                  <Text className="text-neutral-900 font-medium">
                    {filterGender === 'MALE'
                      ? 'Masculino'
                      : filterGender === 'FEMALE'
                        ? 'Feminino'
                        : filterGender === 'OTHER'
                          ? 'Outro'
                          : 'Qualquer'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-neutral-100 rounded-xl p-3"
                  onPress={() =>
                    openPicker(
                      'Câmbio',
                      [
                        { label: 'Qualquer', value: '' },
                        { label: 'Manual', value: 'MANUAL' },
                        { label: 'Automático', value: 'AUTOMATIC' },
                      ],
                      (v) => {
                        setFilterTransmission((v as any) || '');
                        setPicker(null);
                      }
                    )
                  }
                >
                  <Text className="text-neutral-500 text-xs">Câmbio</Text>
                  <Text className="text-neutral-900 font-medium">
                    {filterTransmission === 'MANUAL'
                      ? 'Manual'
                      : filterTransmission === 'AUTOMATIC'
                        ? 'Automático'
                        : 'Qualquer'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-neutral-100 rounded-xl p-3"
                  onPress={() =>
                    openPicker(
                      'Motor',
                      [
                        { label: 'Qualquer', value: '' },
                        { label: 'Combustão', value: 'COMBUSTION' },
                        { label: 'Elétrico', value: 'ELECTRIC' },
                      ],
                      (v) => {
                        setFilterEngineType((v as any) || '');
                        setPicker(null);
                      }
                    )
                  }
                >
                  <Text className="text-neutral-500 text-xs">Motor</Text>
                  <Text className="text-neutral-900 font-medium">
                    {filterEngineType === 'COMBUSTION'
                      ? 'Combustão'
                      : filterEngineType === 'ELECTRIC'
                        ? 'Elétrico'
                        : 'Qualquer'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Picker */}
              {picker && (
                <View className="mt-4">
                  <Text className="text-neutral-700 font-semibold mb-2">{picker.title}</Text>
                  <View className="max-h-52">
                    <ScrollView showsVerticalScrollIndicator={false}>
                      {picker.options.map((opt) => (
                        <TouchableOpacity
                          key={`${picker.title}-${opt.value}`}
                          className="py-3 border-b border-neutral-100"
                          onPress={() => picker.onSelect(opt.value)}
                        >
                          <Text className="text-neutral-900">{opt.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              )}

              <View className="flex-row gap-3 mt-5">
                <TouchableOpacity
                  className="flex-1 bg-neutral-200 rounded-xl p-4"
                  onPress={() => {
                    setFilterState('');
                    setFilterCity('');
                    setFilterNeighborhoodTeach('');
                    setFilterGender('');
                    setFilterTransmission('');
                    setFilterEngineType('');
                    setPicker(null);
                  }}
                >
                  <Text className="text-center font-semibold text-neutral-800">Limpar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-emerald-500 rounded-xl p-4"
                  onPress={() => {
                    setFilterModalOpen(false);
                    setPicker(null);
                    loadInstructors();
                  }}
                >
                  <Text className="text-center font-semibold text-white">Aplicar Filtros</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
          {filteredInstructors.length === 0 && !isLoading ? (
            <View className="flex-1 items-center justify-center py-8">
              <Text className="text-neutral-500">Nenhum instrutor encontrado.</Text>
              <Text className="text-neutral-400 text-sm mt-2">Tente ajustar os filtros ou buscar todos.</Text>
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
                        <Text className="text-amber-600 text-sm font-medium ml-1">{formatRating(instructor.rating)}</Text>
                        <Text className="text-neutral-500 text-sm ml-2">({instructor.completedLessonsCount || 0} aulas)</Text>
                      </View>

                      {instructor.vehicle && (
                        <View className="flex-row items-center">
                          <View className="bg-blue-100 px-2 py-1 rounded">
                            <Text className="text-blue-700 text-xs font-medium">
                              {instructor.vehicle.make} {instructor.vehicle.model}{instructor.vehicle.year ? ` ${instructor.vehicle.year}` : ''}
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

                      {instructor.city && instructor.state && (
                        <View className="flex-row items-center mt-2">
                          <MapPin size={14} color="#6B7280" />
                          <Text className="text-neutral-600 text-xs ml-1">
                            {instructor.city}, {instructor.state}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-neutral-100">
                    <View className="flex-row items-center text-emerald-600">
                      <Calendar size={16} color="#10B981" />
                      <Text className="ml-1 text-sm font-medium">Disponível</Text>
                    </View>
                    <TouchableOpacity
                      className="bg-emerald-500 px-4 py-2 rounded-full"
                      onPress={() => handleInstructorPress(instructor)}
                    >
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
