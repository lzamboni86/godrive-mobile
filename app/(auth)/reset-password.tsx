import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react-native';
import api from '@/services/api';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token || typeof token !== 'string') {
      Alert.alert('Erro', 'Link de redefinição inválido');
      router.replace('/(auth)/login');
      return;
    }

    // Validar o token
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await api.post('/auth/validate-reset-token', { token });
      setIsValidToken(true);
    } catch (error) {
      console.error('Token inválido:', error);
      setIsValidToken(false);
      Alert.alert('Link Inválido', 'Este link de redefinição expirou ou é inválido. Solicite um novo.');
      router.replace('/(auth)/login');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword,
      });

      Alert.alert(
        'Sucesso',
        'Senha redefinida com sucesso! Faça login com sua nova senha.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      Alert.alert(
        'Erro',
        'Não foi possível redefinir sua senha. Tente solicitar um novo link.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text className="text-gray-600 mt-4">Validando link...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">Redefinir Senha</Text>
          <Text className="text-gray-600">Digite sua nova senha abaixo</Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 font-medium mb-2">Nova Senha</Text>
            <View className="relative">
              <View className="absolute left-3 top-1/2 -translate-y-1/2">
                <Lock size={20} color="#9CA3AF" />
              </View>
              <TextInput
                className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:border-blue-500"
                placeholder="Digite sua nova senha"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-2">Confirmar Nova Senha</Text>
            <View className="relative">
              <View className="absolute left-3 top-1/2 -translate-y-1/2">
                <Lock size={20} color="#9CA3AF" />
              </View>
              <TextInput
                className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:border-blue-500"
                placeholder="Confirme sua nova senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            </View>
          </View>

          {newPassword && confirmPassword && newPassword === confirmPassword && (
            <View className="flex-row items-center bg-green-50 px-4 py-3 rounded-xl">
              <CheckCircle size={20} color="#10B981" />
              <Text className="text-green-700 ml-2">As senhas coincidem</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          className={`w-full py-4 rounded-xl mt-8 flex-row items-center justify-center ${
            isLoading
              ? 'bg-gray-300'
              : newPassword && confirmPassword && newPassword === confirmPassword
              ? 'bg-blue-600'
              : 'bg-gray-300'
          }`}
          onPress={handleResetPassword}
          disabled={
            isLoading ||
            !newPassword ||
            !confirmPassword ||
            newPassword !== confirmPassword
          }
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-lg">Redefinir Senha</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full py-4 mt-4"
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text className="text-center text-gray-600">Voltar para Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
