import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, ActivityIndicator, Keyboard, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Mail, Phone, Lock, ArrowLeft, GraduationCap, Eye, EyeOff, MapPin, FileText } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Toast, useToast } from '@/components/ui/Toast';
import { isValidCpf, formatCpf, unmaskCpf } from '@/utils/cpf-validator';
import { fetchAddressByCep } from '@/services/viacep';

export default function StudentSignupScreen() {
  const { signIn } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const insets = useSafeAreaInsets();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [addressZipCode, setAddressZipCode] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressNeighborhood, setAddressNeighborhood] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para busca de CEP
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepError, setCepError] = useState('');
  const numberInputRef = useRef<TextInput>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Busca automática de endereço pelo CEP
  useEffect(() => {
    const cleanCep = addressZipCode.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      setCepError('');
      return;
    }

    const fetchAddress = async () => {
      setIsLoadingCep(true);
      setCepError('');
      
      try {
        const address = await fetchAddressByCep(cleanCep);
        
        if (address) {
          setAddressStreet(address.street);
          setAddressNeighborhood(address.neighborhood);
          setAddressCity(address.city);
          setAddressState(address.state);
          
          // Focar no campo número após preencher
          setTimeout(() => {
            numberInputRef.current?.focus();
          }, 100);
        } else {
          // CEP não encontrado - limpar campos
          setAddressStreet('');
          setCepError('CEP não encontrado');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        setCepError('Erro ao buscar CEP');
      } finally {
        setIsLoadingCep(false);
      }
    };

    fetchAddress();
  }, [addressZipCode]);

  async function handleSignup() {
    console.log('🔐 Student Signup - Dados:', { name, email, phone, cpf: cpf.trim() || undefined, password: '***' });
    
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim() || !confirmPassword.trim()) {
      console.log('🔐 Student Signup - Validação falhou: campos vazios');
      showToast('Preencha todos os campos', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('As senhas não coincidem', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('A senha deve ter pelo menos 6 caracteres', 'error');
      return;
    }

    // Valida CPF se preenchido
    if (cpf.trim() && !isValidCpf(cpf.trim())) {
      showToast('CPF inválido', 'error');
      return;
    }

    setIsLoading(true);
    console.log('🔐 Student Signup - Iniciando requisição...');
    try {
      await api.post('/auth/register/student', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        cpf: unmaskCpf(cpf) || undefined,
        addressZipCode: addressZipCode.trim() || undefined,
        addressStreet: addressStreet.trim() || undefined,
        addressNumber: addressNumber.trim() || undefined,
        addressNeighborhood: addressNeighborhood.trim() || undefined,
        addressCity: addressCity.trim() || undefined,
        addressState: addressState.trim() || undefined,
        addressComplement: addressComplement.trim() || undefined,
        password,
      });

      const studentName = name.trim() || 'Aluno';
      Alert.alert(
        'Cadastro concluído',
        `Cadastro concluído com sucesso!\nSeja bem-vindo(a), ${studentName}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              (async () => {
                try {
                  setIsLoading(true);
                  await signIn({ email: email.trim(), password });
                  router.replace('/(student)' as any);
                } catch (e: any) {
                  Alert.alert('Erro', e?.message || 'Erro ao fazer login. Tente novamente.');
                } finally {
                  setIsLoading(false);
                }
              })();
            },
          },
        ]
      );
    } catch (error: any) {
      showToast(error.message || 'Erro ao cadastrar. Tente novamente.', 'error');
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
        ref={scrollViewRef}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 24 + Math.max(insets.bottom, 16) + keyboardHeight,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
          <View className="flex-1 px-6 pt-20 pb-8">
            {/* Header */}
            <View className="items-center mb-8">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="absolute left-0 top-0 p-2"
              >
                <ArrowLeft size={24} color="#1E3A8A" />
              </TouchableOpacity>
              <View className="w-16 h-16 bg-emerald-500 rounded-2xl items-center justify-center mb-4">
                <GraduationCap size={32} color="#FFFFFF" />
              </View>
              <Text className="text-2xl font-bold text-emerald-600">Cadastro Aluno</Text>
              <Text className="text-neutral-500 mt-2 text-sm">Preencha seus dados</Text>
            </View>

            {/* Form */}
            <View className="space-y-4">
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

              {/* CPF Input */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">CPF</Text>
                <View className="flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50">
                  <FileText size={20} color="#6B7280" />
                  <TextInput
                    className="flex-1 py-4 px-3 text-base text-neutral-900"
                    placeholder="000.000.000-00"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    value={formatCpf(cpf)}
                    onChangeText={(text) => setCpf(formatCpf(text))}
                    maxLength={14}
                  />
                </View>
              </View>

              {/* Address Header */}
              <View className="mb-2">
                <View className="flex-row items-center">
                  <MapPin size={16} color="#6B7280" />
                  <Text className="text-sm font-medium text-neutral-700 ml-2">Endereço (Opcional)</Text>
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">CEP</Text>
                <View className={`flex-row items-center border rounded-xl px-4 bg-neutral-50 ${cepError ? 'border-red-400' : 'border-neutral-300'}`}>
                  <MapPin size={20} color={cepError ? '#F87171' : '#6B7280'} />
                  <TextInput
                    className="flex-1 py-4 px-3 text-base text-neutral-900"
                    placeholder="00000-000"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    value={addressZipCode}
                    onChangeText={setAddressZipCode}
                    maxLength={9}
                  />
                  {isLoadingCep && <ActivityIndicator size="small" color="#10B981" />}
                </View>
                {cepError ? (
                  <Text className="text-red-500 text-xs mt-1">{cepError}</Text>
                ) : (
                  <Text className="text-neutral-500 text-xs mt-1">Digite o CEP para preencher o endereço automaticamente</Text>
                )}
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">Rua</Text>
                <View className="flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50">
                  <MapPin size={20} color="#6B7280" />
                  <TextInput
                    className="flex-1 py-4 px-3 text-base text-neutral-900"
                    placeholder="Rua Exemplo"
                    placeholderTextColor="#9CA3AF"
                    value={addressStreet}
                    onChangeText={setAddressStreet}
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">Número</Text>
                <View className="flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50">
                  <MapPin size={20} color="#6B7280" />
                  <TextInput
                    ref={numberInputRef}
                    className="flex-1 py-4 px-3 text-base text-neutral-900"
                    placeholder="123"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    value={addressNumber}
                    onChangeText={setAddressNumber}
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">Bairro</Text>
                <View className="flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50">
                  <MapPin size={20} color="#6B7280" />
                  <TextInput
                    className="flex-1 py-4 px-3 text-base text-neutral-900"
                    placeholder="Centro"
                    placeholderTextColor="#9CA3AF"
                    value={addressNeighborhood}
                    onChangeText={setAddressNeighborhood}
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">Cidade</Text>
                <View className="flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50">
                  <MapPin size={20} color="#6B7280" />
                  <TextInput
                    className="flex-1 py-4 px-3 text-base text-neutral-900"
                    placeholder="São Paulo"
                    placeholderTextColor="#9CA3AF"
                    value={addressCity}
                    onChangeText={setAddressCity}
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">UF</Text>
                <View className="flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50">
                  <MapPin size={20} color="#6B7280" />
                  <TextInput
                    className="flex-1 py-4 px-3 text-base text-neutral-900"
                    placeholder="SP"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="characters"
                    value={addressState}
                    onChangeText={setAddressState}
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">Complemento</Text>
                <View className="flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50">
                  <MapPin size={20} color="#6B7280" />
                  <TextInput
                    className="flex-1 py-4 px-3 text-base text-neutral-900"
                    placeholder="Apto 12"
                    placeholderTextColor="#9CA3AF"
                    value={addressComplement}
                    onChangeText={setAddressComplement}
                  />
                </View>
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
                    onFocus={() => {
                      setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                      }, 50);
                    }}
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
                    onFocus={() => {
                      setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                      }, 50);
                    }}
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
                className="bg-emerald-500 py-4 rounded-xl"
              >
                <Text className="text-white text-base font-semibold">Criar Conta</Text>
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
