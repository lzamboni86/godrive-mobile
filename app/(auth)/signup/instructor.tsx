import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Modal, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, User, Mail, Phone, FileText, Car, Lock, Check, Eye, EyeOff, MapPin } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '@/services/api';
import { Button } from '@/components/ui/Button';
import { getIbgeCitiesByUf, getIbgeStates, IbgeCity, IbgeState, getNeighborhoodsByCityDynamic } from '@/services/ibge';
import { getFipeMarcas, getFipeModelos, FipeMarca, FipeModelo } from '@/services/fipe';
export default function InstructorSignupScreen() {
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cnh, setCnh] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>('');

  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [neighborhoodReside, setNeighborhoodReside] = useState('');
  const [neighborhoodTeach, setNeighborhoodTeach] = useState('');

  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [transmission, setTransmission] = useState<'MANUAL' | 'AUTOMATIC' | ''>('');
  const [engineType, setEngineType] = useState<'COMBUSTION' | 'ELECTRIC' | ''>('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [picker, setPicker] = useState<{ title: string; options: { label: string; value: string }[]; onSelect: (v: string) => void } | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [ibgeStates, setIbgeStates] = useState<IbgeState[]>([]);
  const [ibgeCities, setIbgeCities] = useState<IbgeCity[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingNeighborhoods, setIsLoadingNeighborhoods] = useState(false);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);

  // Estados para FIPE
  const [vehicleMarcas, setVehicleMarcas] = useState<FipeMarca[]>([]);
  const [vehicleModelos, setVehicleModelos] = useState<FipeModelo[]>([]);
  const [isLoadingMarcas, setIsLoadingMarcas] = useState(false);
  const [isLoadingModelos, setIsLoadingModelos] = useState(false);
  const [selectedMarcaCodigo, setSelectedMarcaCodigo] = useState<string>('');

  const stateLabel = useMemo(() => {
    if (!state) return '';
    return ibgeStates.find((s) => s.sigla === state)?.nome || state;
  }, [ibgeStates, state]);

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

  const loadVehicleMarcas = async () => {
    try {
      setIsLoadingMarcas(true);
      const data = await getFipeMarcas();
      setVehicleMarcas(data);
    } catch (e) {
      console.error('Erro ao carregar marcas:', e);
      Alert.alert('Erro', 'Não foi possível carregar as marcas de veículos. Tente novamente.');
    } finally {
      setIsLoadingMarcas(false);
    }
  };

  const loadVehicleModelos = async (marcaCodigo: string) => {
    if (!marcaCodigo) {
      setVehicleModelos([]);
      return;
    }

    try {
      setIsLoadingModelos(true);
      console.log(`🚗 Carregando modelos para marca: ${marcaCodigo}`);
      const data = await getFipeModelos(marcaCodigo);
      console.log(`✅ Modelos carregados:`, data);
      setVehicleModelos(data);
    } catch (e) {
      console.error('❌ Erro ao carregar modelos:', e);
      setVehicleModelos([]);
      // Mostrar mensagem amigável para o usuário
      Alert.alert(
        'Aviso',
        'Não foi possível carregar os modelos desta marca. Tente selecionar outra marca.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoadingModelos(false);
    }
  };

  useEffect(() => {
    loadStates();
    loadVehicleMarcas(); // Carregar marcas ao montar a tela
  }, []);

  useEffect(() => {
    if (city && state) {
      loadNeighborhoods(city, state);
    } else {
      setNeighborhoods([]);
      setNeighborhoodTeach('');
    }
  }, [city, state]);

  useEffect(() => {
    // Carregar modelos quando marca for selecionada
    if (selectedMarcaCodigo) {
      loadVehicleModelos(selectedMarcaCodigo);
    } else {
      setVehicleModelos([]);
      setVehicleModel(''); // Limpar modelo quando marca mudar
    }
  }, [selectedMarcaCodigo]);

  const openPicker = (title: string, options: { label: string; value: string }[], onSelect: (v: string) => void) => {
    setPicker({ title, options, onSelect });
    setPickerOpen(true);
  };

  async function handleSignup() {
    console.log('🔐 Instructor Signup - Dados:', { 
      name,
      email,
      phone,
      cnh,
      gender,
      state,
      city,
      neighborhoodReside,
      neighborhoodTeach,
      vehicleMake,
      vehicleYear,
      transmission,
      engineType,
      vehicleModel,
      vehiclePlate,
      hourlyRate,
      pixKey,
      password: '***'
    });
    
    if (!name.trim() || !email.trim() || !phone.trim() || !cnh.trim() ||
        !gender.trim() || !state.trim() || !city.trim() || !neighborhoodReside.trim() || !neighborhoodTeach.trim() ||
        !vehicleMake.trim() || !vehicleYear.trim() || !transmission.trim() || !engineType.trim() || !vehicleModel.trim() ||
        !vehiclePlate.trim() || !hourlyRate.trim() || !pixKey.trim() || !password.trim() || !confirmPassword.trim()) {
      console.log('🔐 Instructor Signup - Validação falhou: campos vazios');
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    // Validar valor da hora/aula
    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate <= 0) {
      Alert.alert('Erro', 'Digite um valor válido para a hora/aula');
      return;
    }

    const year = parseInt(vehicleYear, 10);
    if (isNaN(year) || year < 1980 || year > 2100) {
      Alert.alert('Erro', 'Digite um ano de veículo válido');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    console.log('🔐 Instructor Signup - Iniciando requisição...');
    try {
      // Usar o serviço de API
      const response = await api.post('/auth/register/instructor', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        cnh: cnh.trim(),
        gender: gender,
        state: state.trim(),
        city: city.trim(),
        neighborhoodReside: neighborhoodReside.trim(),
        neighborhoodTeach: neighborhoodTeach.trim(),
        vehicleMake: vehicleMake.trim(),
        vehicleYear: year,
        transmission: transmission,
        engineType: engineType,
        vehicleModel: vehicleModel.trim(),
        vehiclePlate: vehiclePlate.trim(),
        hourlyRate: rate,
        pixKey: pixKey.trim(),
        password,
      });

      Alert.alert('Sucesso', 'Cadastro recebido! Entraremos em contato em até 48h.');
      router.replace('/(auth)/pending-approval');
    } catch (error: any) {
      console.error('🔐 Instructor Signup - Erro:', error);
      Alert.alert('Erro', error.message || 'Erro ao cadastrar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
          <View className="flex-1 px-6 pt-20 pb-8">
            {/* Header */}
            <View className="items-center mb-6">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="absolute left-0 top-0 p-2"
              >
                <ArrowLeft size={24} color="#1E3A8A" />
              </TouchableOpacity>
              <View className="w-16 h-16 bg-blue-500 rounded-2xl items-center justify-center mb-4">
                <Car size={32} color="#FFFFFF" />
              </View>
              <Text className="text-2xl font-bold text-blue-600">Cadastro Instrutor</Text>
              <Text className="text-neutral-500 mt-2 text-sm">Preencha seus dados profissionais</Text>
            </View>

            {/* Form */}
            <View className="space-y-4">
              <Modal
                visible={pickerOpen}
                transparent
                animationType="slide"
                onRequestClose={() => {
                  setPickerOpen(false);
                  setPicker(null);
                }}
              >
                <View className="flex-1 bg-black/40 justify-end">
                  <View className="bg-white rounded-t-3xl p-5">
                    <View className="flex-row items-center justify-between mb-4">
                      <Text className="text-neutral-900 font-semibold text-lg">{picker?.title || 'Selecionar'}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setPickerOpen(false);
                          setPicker(null);
                        }}
                      >
                        <Text className="text-blue-600 font-semibold">Fechar</Text>
                      </TouchableOpacity>
                    </View>

                    <View className="max-h-96">
                      <ScrollView 
                        showsVerticalScrollIndicator={true}
                        indicatorStyle="black"
                        contentContainerStyle={{ paddingBottom: 20 }}
                      >
                        {(picker?.options || []).map((opt) => (
                          <TouchableOpacity
                            key={`${picker?.title}-${opt.value}`}
                            className="py-4 border-b border-neutral-100"
                            onPress={() => {
                              picker?.onSelect(opt.value);
                              setPickerOpen(false);
                              setPicker(null);
                            }}
                          >
                            <Text className="text-neutral-900 text-base">{opt.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </View>
              </Modal>

              {/* Name Input */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">Nome Completo</Text>
                <View className="flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50">
                  <User size={20} color="#6B7280" />
                  <TextInput
                    className="flex-1 py-4 px-3 text-base text-neutral-900"
                    placeholder="Seu nome completo"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Email Input */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">E-mail</Text>
                <View className="flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50">
                  <Mail size={20} color="#6B7280" />
                  <TextInput
                    className="flex-1 py-4 px-3 text-base text-neutral-900"
                    placeholder="seu@email.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              {/* Phone Input */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">WhatsApp</Text>
                <View className="flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50">
                  <Phone size={20} color="#6B7280" />
                  <TextInput
                    className="flex-1 py-4 px-3 text-base text-neutral-900"
                    placeholder="(11) 99999-9999"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
              </View>

              {/* CNH Input */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">Registro da CNH <Text className="text-red-500">*</Text></Text>
                <View className="flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50">
                  <Car size={20} color="#6B7280" />
                  <TextInput
                    className="flex-1 py-4 px-3 text-base text-neutral-900"
                    placeholder="Número da sua CNH"
                    placeholderTextColor="#9CA3AF"
                    value={cnh}
                    onChangeText={setCnh}
                  />
                </View>
                <Text className="text-neutral-500 text-xs mt-1">
                  Campo obrigatório para cadastro
                </Text>
              </View>

              {/* Gender */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">Sexo</Text>
                <TouchableOpacity
                  className="flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50 py-4"
                  onPress={() =>
                    openPicker(
                      'Sexo',
                      [
                        { label: 'Masculino', value: 'MALE' },
                        { label: 'Feminino', value: 'FEMALE' },
                        { label: 'Outro', value: 'OTHER' },
                      ],
                      (v) => setGender(v as any)
                    )
                  }
                >
                  <User size={20} color="#6B7280" />
                  <Text className="flex-1 px-3 text-base text-neutral-900">
                    {gender === 'MALE' ? 'Masculino' : gender === 'FEMALE' ? 'Feminino' : gender === 'OTHER' ? 'Outro' : 'Selecione'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* State */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">Estado</Text>
                <TouchableOpacity
                  className="flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50 py-4"
                  disabled={isLoadingStates}
                  onPress={() =>
                    openPicker(
                      'Estado',
                      ibgeStates.map((s) => ({ label: s.nome, value: s.sigla })),
                      (v) => {
                        setState(v);
                        setCity('');
                        setIbgeCities([]);
                        setNeighborhoodReside('');
                        setNeighborhoodTeach('');
                        loadCities(v);
                      }
                    )
                  }
                >
                  <MapPin size={20} color="#6B7280" />
                  <Text className="flex-1 px-3 text-base text-neutral-900">
                    {stateLabel || (isLoadingStates ? 'Carregando...' : 'Selecione')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* City */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">Cidade</Text>
                <TouchableOpacity
                  className={`flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50 py-4 ${
                    state && !isLoadingCities ? '' : 'opacity-50'
                  }`}
                  disabled={!state || isLoadingCities}
                  onPress={() =>
                    openPicker(
                      'Cidade',
                      ibgeCities.map((c) => ({ label: c.nome, value: c.nome })),
                      (v) => {
                        setCity(v);
                        setNeighborhoodReside('');
                        setNeighborhoodTeach('');
                      }
                    )
                  }
                >
                  <MapPin size={20} color="#6B7280" />
                  <Text className="flex-1 px-3 text-base text-neutral-900">
                    {!state
                      ? 'Selecione o estado'
                      : isLoadingCities
                        ? 'Carregando...'
                        : city || 'Selecione'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Neighborhood Reside */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">Bairro de Residência</Text>
                <TouchableOpacity
                  className={`flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50 py-4 ${
                    city ? '' : 'opacity-50'
                  }`}
                  disabled={!city}
                  onPress={() =>
                    openPicker(
                      'Bairro de Residência',
                      neighborhoods.map((b: string) => ({ label: b, value: b })),
                      (v) => setNeighborhoodReside(v)
                    )
                  }
                >
                  <MapPin size={20} color="#6B7280" />
                  <Text className="flex-1 px-3 text-base text-neutral-900">
                    {!city
                      ? 'Selecione a cidade'
                      : isLoadingNeighborhoods
                        ? 'Carregando bairros...'
                        : neighborhoods.length === 0
                          ? 'Nenhum bairro encontrado'
                          : neighborhoodReside || 'Selecione'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Neighborhood Teach */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">Bairro de Atendimento</Text>
                <TouchableOpacity
                  className={`flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50 py-4 ${
                    city ? '' : 'opacity-50'
                  }`}
                  disabled={!city}
                  onPress={() =>
                    openPicker(
                      'Bairro de Atendimento',
                      neighborhoods.map((b: string) => ({ label: b, value: b })),
                      (v) => setNeighborhoodTeach(v)
                    )
                  }
                >
                  <MapPin size={20} color="#6B7280" />
                  <Text className="flex-1 px-3 text-base text-neutral-900">
                    {!city
                      ? 'Selecione a cidade'
                      : isLoadingNeighborhoods
                        ? 'Carregando bairros...'
                        : neighborhoods.length === 0
                          ? 'Nenhum bairro encontrado'
                          : neighborhoodTeach || 'Selecione'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Vehicle Make */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">Marca do Veículo</Text>
                <TouchableOpacity
                  className={`flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50 py-4 ${
                    isLoadingMarcas ? 'opacity-50' : ''
                  }`}
                  disabled={isLoadingMarcas}
                  onPress={() => {
                    if (vehicleMarcas.length === 0 && !isLoadingMarcas) {
                      // Tentar recarregar se falhou
                      loadVehicleMarcas();
                      return;
                    }
                    openPicker(
                      'Marca do Veículo',
                      vehicleMarcas.map((marca: FipeMarca) => ({ label: marca.nome, value: marca.codigo })),
                      (codigo: string) => {
                        const marcaSelecionada = vehicleMarcas.find(m => m.codigo === codigo);
                        setVehicleMake(marcaSelecionada?.nome || '');
                        setSelectedMarcaCodigo(codigo);
                      }
                    );
                  }}
                  onLongPress={() => {
                    // Recarregar marcas com long press
                    if (!isLoadingMarcas) {
                      loadVehicleMarcas();
                    }
                  }}
                >
                  <Car size={20} color="#6B7280" />
                  {isLoadingMarcas ? (
                    <>
                      <Text className="flex-1 px-3 text-base text-neutral-500">Carregando marcas...</Text>
                      <ActivityIndicator size="small" color="#6B7280" />
                    </>
                  ) : (
                    <>
                      <Text className="flex-1 px-3 text-base text-neutral-900">
                        {vehicleMarcas.length === 0 ? 'Tentar novamente' : (vehicleMake || 'Selecione')}
                      </Text>
                      {vehicleMarcas.length === 0 && (
                        <Text className="text-red-500 text-xs">Falha ao carregar</Text>
                      )}
                    </>
                  )}
                </TouchableOpacity>
                <Text className="text-neutral-500 text-xs mt-1">
                  Dados da Tabela FIPE • Pressione e segure para recarregar
                </Text>
              </View>

              {/* Vehicle Model */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">Modelo do Veículo</Text>
                <TouchableOpacity
                  className={`flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50 py-4 ${
                    !selectedMarcaCodigo || isLoadingModelos ? 'opacity-50' : ''
                  }`}
                  disabled={!selectedMarcaCodigo || isLoadingModelos}
                  onPress={() => {
                    if (vehicleModelos.length === 0 && !isLoadingModelos) {
                      // Tentar recarregar se falhou
                      loadVehicleModelos(selectedMarcaCodigo);
                      return;
                    }
                    openPicker(
                      'Modelo do Veículo',
                      vehicleModelos.map((modelo: FipeModelo) => ({ label: modelo.nome, value: modelo.codigo })),
                      (codigo: string) => {
                        const modeloSelecionado = vehicleModelos.find(m => m.codigo === codigo);
                        setVehicleModel(modeloSelecionado?.nome || '');
                      }
                    );
                  }}
                  onLongPress={() => {
                    // Recarregar modelos com long press
                    if (!isLoadingModelos && selectedMarcaCodigo) {
                      loadVehicleModelos(selectedMarcaCodigo);
                    }
                  }}
                >
                  <Car size={20} color="#6B7280" />
                  {isLoadingModelos ? (
                    <>
                      <Text className="flex-1 px-3 text-base text-neutral-500">Carregando modelos...</Text>
                      <ActivityIndicator size="small" color="#6B7280" />
                    </>
                  ) : (
                    <>
                      <Text className="flex-1 px-3 text-base text-neutral-900">
                        {!selectedMarcaCodigo
                          ? 'Selecione uma marca'
                          : vehicleModelos.length === 0
                            ? 'Tentar novamente'
                            : (vehicleModel || 'Selecione')}
                      </Text>
                      {selectedMarcaCodigo && vehicleModelos.length === 0 && (
                        <Text className="text-red-500 text-xs">Falha ao carregar</Text>
                      )}
                    </>
                  )}
                </TouchableOpacity>
                <Text className="text-neutral-500 text-xs mt-1">
                  Modelos disponíveis para a marca selecionada
                </Text>
              </View>

              {/* Vehicle Plate Input */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">Placa do Veículo</Text>
                <View className="flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50">
                  <Car size={20} color="#6B7280" />
                  <TextInput
                    className="flex-1 py-4 px-3 text-base text-neutral-900"
                    placeholder="ABC-1234"
                    placeholderTextColor="#9CA3AF"
                    value={vehiclePlate}
                    onChangeText={setVehiclePlate}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              {/* Vehicle Year */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">Ano do Veículo</Text>
                <View className="flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50">
                  <Car size={20} color="#6B7280" />
                  <TextInput
                    className="flex-1 py-4 px-3 text-base text-neutral-900"
                    placeholder="Ex: 2022"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={vehicleYear}
                    onChangeText={setVehicleYear}
                  />
                </View>
              </View>

              {/* Transmission */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">Câmbio</Text>
                <TouchableOpacity
                  className="flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50 py-4"
                  onPress={() =>
                    openPicker(
                      'Câmbio',
                      [
                        { label: 'Manual', value: 'MANUAL' },
                        { label: 'Automático', value: 'AUTOMATIC' },
                      ],
                      (v) => setTransmission(v as any)
                    )
                  }
                >
                  <Car size={20} color="#6B7280" />
                  <Text className="flex-1 px-3 text-base text-neutral-900">
                    {transmission === 'MANUAL' ? 'Manual' : transmission === 'AUTOMATIC' ? 'Automático' : 'Selecione'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Engine Type */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">Motor</Text>
                <TouchableOpacity
                  className="flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50 py-4"
                  onPress={() =>
                    openPicker(
                      'Motor',
                      [
                        { label: 'Combustão', value: 'COMBUSTION' },
                        { label: 'Elétrico', value: 'ELECTRIC' },
                      ],
                      (v) => setEngineType(v as any)
                    )
                  }
                >
                  <Car size={20} color="#6B7280" />
                  <Text className="flex-1 px-3 text-base text-neutral-900">
                    {engineType === 'COMBUSTION' ? 'Combustão' : engineType === 'ELECTRIC' ? 'Elétrico' : 'Selecione'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* PIX Input */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">Chave PIX para Pagamento</Text>
                <View className="flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50">
                  <Text className="text-neutral-500 mr-2">@</Text>
                  <TextInput
                    className="flex-1 py-4 px-3 text-base text-neutral-900"
                    placeholder="seu-pix@banco.com.br"
                    placeholderTextColor="#9CA3AF"
                    value={pixKey}
                    onChangeText={setPixKey}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <Text className="text-neutral-500 text-xs mt-1">
                  Sua chave PIX para receber pagamentos das aulas
                </Text>
              </View>

              {/* Hourly Rate Input */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">Valor da Hora/Aula (R$)</Text>
                <View className="flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50">
                  <Text className="text-neutral-500 mr-2">R$</Text>
                  <TextInput
                    className="flex-1 py-4 px-3 text-base text-neutral-900"
                    placeholder="80.00"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={hourlyRate}
                    onChangeText={setHourlyRate}
                  />
                </View>
                <Text className="text-neutral-500 text-xs mt-1">
                  Valor que você cobrará por hora de aula
                </Text>
              </View>

              {/* Password Input */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">Senha</Text>
                <View className="flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50">
                  <Lock size={20} color="#6B7280" />
                  <TextInput
                    className="flex-1 py-4 px-3 text-base text-neutral-900"
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <Button
                    variant="ghost"
                    onPress={() => setShowPassword(!showPassword)}
                    className="p-2"
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#6B7280" />
                    ) : (
                      <Eye size={20} color="#6B7280" />
                    )}
                  </Button>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-neutral-700 mb-2">Confirmar Senha</Text>
                <View className="flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50">
                  <Lock size={20} color="#6B7280" />
                  <TextInput
                    className="flex-1 py-4 px-3 text-base text-neutral-900"
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <Button
                    variant="ghost"
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#6B7280" />
                    ) : (
                      <Eye size={20} color="#6B7280" />
                    )}
                  </Button>
                </View>
              </View>

              {/* Signup Button */}
              <Button
                onPress={handleSignup}
                loading={isLoading}
                className="bg-blue-500 py-4 rounded-xl"
              >
                <Text className="text-white text-base font-semibold">Enviar Cadastro</Text>
              </Button>
            </View>

            {/* Footer */}
            <View className="mt-auto pt-8">
              <Text className="text-center text-neutral-400 text-xs">
                Go Drive Group
              </Text>
              <Text className="text-center text-neutral-400 text-xs mt-1">
                Desenvolvido por: Delta Pro Tecnologia
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
