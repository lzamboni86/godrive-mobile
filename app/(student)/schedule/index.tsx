import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Filter, ArrowLeft, MapPin, Star, Calendar, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { studentService, Instructor, InstructorSearchFilters } from '@/services/student';
import { useAuth } from '@/contexts/AuthContext';
import { getIbgeCitiesByUf, getIbgeStates, getNeighborhoodsByCityDynamic, IbgeCity, IbgeState } from '@/services/ibge';

export default function ScheduleSearchScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const filterModalBottomPadding = 24 + Math.max(insets.bottom, 16);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [filteredInstructors, setFilteredInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [picker, setPicker] = useState<{ title: string; options: { label: string; value: string }[]; onSelect: (v: string) => void } | null>(null);

  const [filterState, setFilterState] = useState<string>('');
  const [filterUf, setFilterUf] = useState<string>('');
  const [filterCity, setFilterCity] = useState<string>('');
  const [filterNeighborhoodTeach, setFilterNeighborhoodTeach] = useState<string>('');
  const [filterGender, setFilterGender] = useState<InstructorSearchFilters['gender'] | ''>('');
  const [filterTransmission, setFilterTransmission] = useState<InstructorSearchFilters['transmission'] | ''>('');
  const [filterEngineType, setFilterEngineType] = useState<InstructorSearchFilters['engineType'] | ''>('');

  const [ibgeStates, setIbgeStates] = useState<IbgeState[]>([]);
  const [ibgeCities, setIbgeCities] = useState<IbgeCity[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingNeighborhoods, setIsLoadingNeighborhoods] = useState(false);

  const loadStates = async () => {
    try {
      setIsLoadingStates(true);
      const data = await getIbgeStates();
      setIbgeStates(data);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar os estados. Verifique sua conexão.');
    } finally {
      setIsLoadingStates(false);
    }
  };

  const loadCities = async (uf: string) => {
    try {
      setIsLoadingCities(true);
      const data = await getIbgeCitiesByUf(uf);
      setIbgeCities(data);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar as cidades. Verifique sua conexão.');
    } finally {
      setIsLoadingCities(false);
    }
  };

  const loadNeighborhoods = async (cityName: string, stateUf: string) => {
    if (!cityName || !stateUf) {
      setNeighborhoods([]);
      return;
    }

    try {
      setIsLoadingNeighborhoods(true);
      const data = await getNeighborhoodsByCityDynamic(cityName, stateUf);
      setNeighborhoods(data);
    } catch (e) {
      console.error('Erro ao carregar bairros:', e);
      setNeighborhoods([]);
    } finally {
      setIsLoadingNeighborhoods(false);
    }
  };

  // Atualizar bairros quando a cidade muda
  useEffect(() => {
    if (filterCity && filterUf) {
      loadNeighborhoods(filterCity, filterUf);
    } else {
      setNeighborhoods([]);
      setFilterNeighborhoodTeach('');
    }
  }, [filterCity, filterUf]);

  useEffect(() => {
    setIsLoading(false);
    // Carregar instrutores sem filtros ao iniciar
    loadInstructors();
    loadStates();
  }, []);

  useEffect(() => {
    filterInstructors();
  }, [searchTerm, selectedFilter, instructors]);

  const loadInstructors = async () => {
    try {
      setIsLoading(true);

      // Montar filtros apenas com valores preenchidos
      const filters: any = {};
      if (filterUf) filters.state = filterUf;
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
            <View className="bg-white rounded-t-3xl p-5" style={{ paddingBottom: filterModalBottomPadding }}>
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
                  disabled={isLoadingStates}
                  onPress={() =>
                    openPicker(
                      'Estado',
                      [
                        { label: 'Qualquer', value: '' },
                        ...ibgeStates.map((s) => ({ label: s.nome, value: s.sigla })),
                      ],
                      (v) => {
                        const uf = (v || '').trim();
                        const name = uf ? ibgeStates.find((s) => s.sigla === uf)?.nome || '' : '';
                        setFilterUf(uf);
                        setFilterState(name);
                        setFilterCity('');
                        setIbgeCities([]);
                        setFilterNeighborhoodTeach('');
                        if (uf) {
                          loadCities(uf);
                        }
                        setPicker(null);
                      }
                    )
                  }
                >
                  <Text className="text-neutral-500 text-xs">Estado</Text>
                  <Text className="text-neutral-900 font-medium">
                    {filterState || (isLoadingStates ? 'Carregando...' : 'Qualquer')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`bg-neutral-100 rounded-xl p-3 ${filterUf && !isLoadingCities ? '' : 'opacity-50'}`}
                  disabled={!filterUf || isLoadingCities}
                  onPress={() =>
                    openPicker(
                      'Cidade',
                      [
                        { label: 'Qualquer', value: '' },
                        ...ibgeCities.map((c) => ({ label: c.nome, value: c.nome })),
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
                  <Text className="text-neutral-900 font-medium">
                    {!filterUf
                      ? 'Selecione o estado'
                      : isLoadingCities
                        ? 'Carregando...'
                        : filterCity || 'Qualquer'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`bg-neutral-100 rounded-xl p-3 ${!filterCity ? 'opacity-50' : ''}`}
                  disabled={!filterCity}
                  onPress={() =>
                    openPicker(
                      'Bairro de Atendimento',
                      [
                        { label: 'Qualquer', value: '' },
                        ...neighborhoods.map((b) => ({ label: b, value: b })),
                      ],
                      (v) => {
                        setFilterNeighborhoodTeach(v);
                        setPicker(null);
                      }
                    )
                  }
                >
                  <Text className="text-neutral-500 text-xs">Bairro de Atendimento</Text>
                  <Text className="text-neutral-900 font-medium">
                    {!filterCity
                      ? 'Selecione a cidade'
                      : isLoadingNeighborhoods
                        ? 'Carregando bairros...'
                        : neighborhoods.length === 0
                          ? 'Nenhum bairro encontrado'
                          : filterNeighborhoodTeach || 'Qualquer'}
                  </Text>
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
                    setFilterUf('');
                    setFilterCity('');
                    setIbgeCities([]);
                    setNeighborhoods([]);
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

                      {/* Veículo */}
                      {instructor.vehicle && (
                        <View className="flex-row items-center mb-2">
                          <View className="bg-blue-100 px-2 py-1 rounded">
                            <Text className="text-blue-700 text-xs font-medium">
                              {instructor.vehicle.make} {instructor.vehicle.model}{instructor.vehicle.year ? ` ${instructor.vehicle.year}` : ''}
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* CNH (sempre exibir se existir) */}
                      {instructor.cnh && (
                        <View className="flex-row items-center mb-2">
                          <View className="bg-purple-100 px-2 py-1 rounded">
                            <Text className="text-purple-700 text-xs font-medium">
                              CNH {instructor.cnh}
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Bairro de atendimento (sempre exibir se existir) */}
                      {instructor.neighborhoodTeach && (
                        <View className="flex-row items-center mb-2">
                          <MapPin size={14} color="#6B7280" />
                          <Text className="text-neutral-600 text-xs ml-1">
                            Bairro: {instructor.neighborhoodTeach}
                          </Text>
                        </View>
                      )}

                      {/* Cidade/Estado (sempre exibir se existir) */}
                      {instructor.city && instructor.state && (
                        <View className="flex-row items-center">
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
