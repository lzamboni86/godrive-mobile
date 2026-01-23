import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { authService } from '@/services/auth';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu e-mail.');
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Por favor, informe um e-mail válido.');
      return;
    }

    try {
      setIsLoading(true);
      await authService.forgotPassword(email);
      setIsSuccess(true);
    } catch (error: any) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      
      // Mostrar mensagem genérica mesmo que o email não exista (segurança)
      if (error.response?.status === 404) {
        setIsSuccess(true);
      } else {
        Alert.alert(
          'Erro',
          'Não foi possível enviar o e-mail de recuperação. Tente novamente.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 p-6 justify-center">
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-4">
              <CheckCircle size={40} color="#10B981" />
            </View>
            <Text className="text-2xl font-bold text-neutral-900 text-center mb-2">
              E-mail Enviado!
            </Text>
            <Text className="text-neutral-600 text-center text-base leading-relaxed">
              Enviamos um link para redefinição de senha para o e-mail informado. 
              Verifique sua caixa de entrada e também a pasta de spam.
            </Text>
          </View>

          <View className="space-y-4">
            <Text className="text-neutral-500 text-sm text-center">
              Não recebeu o e-mail? Verifique se o endereço está correto ou tente novamente.
            </Text>

            <TouchableOpacity
              className="bg-emerald-500 rounded-xl p-4"
              onPress={() => router.back()}
            >
              <Text className="text-white font-semibold text-center">
                Voltar para o Login
              </Text>
            </TouchableOpacity>
          </View>
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
          <Text className="text-lg font-semibold text-neutral-900">Recuperar Senha</Text>
          <View className="w-6" />
        </View>

        <View className="flex-1 p-6">
          <View className="mb-8">
            <Text className="text-neutral-900 text-2xl font-bold mb-4">
              Esqueceu sua senha?
            </Text>
            <Text className="text-neutral-600 text-base leading-relaxed">
              Não se preocupe! Informe o e-mail cadastrado e enviaremos um link 
              para você redefinir sua senha.
            </Text>
          </View>

          <View className="space-y-6">
            {/* Campo de Email */}
            <View>
              <Text className="text-sm font-medium text-neutral-700 mb-2">
                E-mail Cadastrado
              </Text>
              <TextInput
                className="bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900"
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Informações Importantes */}
            <View className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <Text className="text-amber-800 text-sm font-medium mb-2">
                📧 Importante:
              </Text>
              <Text className="text-amber-700 text-sm leading-relaxed">
                • O link de recuperação é válido por 1 hora{'\n'}
                • Verifique também sua pasta de spam{'\n'}
                • Caso não encontre, tente novamente em alguns minutos
              </Text>
            </View>

            {/* Botão Enviar */}
            <TouchableOpacity
              className="bg-emerald-500 rounded-xl p-4 flex-row items-center justify-center"
              onPress={handleSubmit}
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Mail size={20} color="#FFFFFF" />
              )}
              <Text className="text-white font-semibold ml-2">
                {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </Text>
            </TouchableOpacity>

            {/* Link para Voltar */}
            <TouchableOpacity
              className="items-center py-4"
              onPress={() => router.back()}
            >
              <Text className="text-neutral-600 text-sm">
                Lembrou sua senha?{' '}
                <Text className="text-emerald-600 font-medium">Voltar para o Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
