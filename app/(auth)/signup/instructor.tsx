import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, User, Mail, Phone, FileText, Car, Lock, Check, Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '@/services/api';
import { Button } from '@/components/ui/Button';
export default function InstructorSignupScreen() {
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cnh, setCnh] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignup() {
    console.log('🔐 Instructor Signup - Dados:', { 
      name, email, phone, cnh, vehicleModel, vehiclePlate, hourlyRate, password: '***' 
    });
    
    if (!name.trim() || !email.trim() || !phone.trim() || !cnh.trim() || 
        !vehicleModel.trim() || !vehiclePlate.trim() || !hourlyRate.trim() || 
        !password.trim() || !confirmPassword.trim()) {
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
        vehicleModel: vehicleModel.trim(),
        vehiclePlate: vehiclePlate.trim(),
        hourlyRate: rate,
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
                <Text className="text-sm font-medium text-neutral-700 mb-2">Registro da CNH</Text>
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
              </View>

              {/* Vehicle Model Input */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-neutral-700 mb-2">Modelo do Veículo</Text>
                <View className="flex-row items-center border border-neutral-300 rounded-xl px-4 bg-neutral-50">
                  <Car size={20} color="#6B7280" />
                  <TextInput
                    className="flex-1 py-4 px-3 text-base text-neutral-900"
                    placeholder="Ex: Fiat Palio 2022"
                    placeholderTextColor="#9CA3AF"
                    value={vehicleModel}
                    onChangeText={setVehicleModel}
                  />
                </View>
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
                © 2025 Delta Pro Tecnologia
              </Text>
              <Text className="text-center text-neutral-400 text-xs mt-1">
                Versão 1.0.0
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
