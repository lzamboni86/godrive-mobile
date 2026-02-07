import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      await signIn({ email: email.trim(), password });
      // Redirecionamento é gerenciado automaticamente pelo _layout.tsx baseado no role
    } catch (error: any) {
      console.log('🔐 Login screen error:', error);
      const errorMessage = error?.message || error?.error?.message || 'Erro ao fazer login';
      console.log('🔐 Final message to show:', errorMessage);
      
      // Usar Alert nativo que sempre funciona
      Alert.alert('Erro de Login', errorMessage);
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
        <View className="flex-1 px-6 pt-20" style={{ paddingBottom: 24 + Math.max(insets.bottom, 16) }}>
          {/* Logo Section */}
          <View className="items-center mb-12">
            <View className="w-40 h-40 bg-white rounded-2xl items-center justify-center mb-6 shadow-xl border border-neutral-100">
              <Image 
                source={require('@/assets/images/logo-app.png')}
                className="w-32 h-32 rounded-xl"
                resizeMode="contain"
              />
            </View>
            <Text className="text-2xl font-bold text-neutral-900 tracking-wide">GO DRIVE</Text>
          </View>

          {/* Form Section */}
          <View className="space-y-4">
            <Text className="text-2xl font-semibold text-neutral-900 mb-6">
              Entrar na sua conta
            </Text>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-neutral-700 mb-2">Email</Text>
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

            {/* Password Input */}
            <View className="mb-6">
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

            {/* Login Button */}
            <Button
              onPress={handleLogin}
              loading={isLoading}
              className="bg-brand-primary py-4 rounded-xl"
            >
              <Text className="text-white text-base font-semibold">Entrar</Text>
            </Button>

            {/* Sign Up Link */}
            <Button
              variant="ghost"
              onPress={() => router.push('/(auth)/profile-selection')}
              className="mt-4"
            >
              <Text className="text-brand-primary text-sm">Não tem uma conta? Cadastre-se</Text>
            </Button>

            {/* Forgot Password */}
            <Button
              variant="ghost"
              onPress={() => router.push('/(auth)/forgot-password' as any)}
              className="mt-2"
            >
              <Text className="text-brand-primary text-sm">Esqueceu sua senha?</Text>
            </Button>
          </View>

          {/* Footer */}
          <View className="mt-auto pt-8">
            <View className="flex-row justify-center space-x-4 mb-4">
              <Button
                variant="ghost"
                onPress={() => router.push('/(auth)/privacy-policy' as any)}
                className="p-0"
              >
                <Text className="text-brand-primary text-xs underline">Política de Privacidade</Text>
              </Button>
              <Text className="text-neutral-400 text-xs">•</Text>
              <Button
                variant="ghost"
                onPress={() => router.push('/(auth)/terms-of-use' as any)}
                className="p-0"
              >
                <Text className="text-brand-primary text-xs underline">Termo de uso</Text>
              </Button>
            </View>
            <Text className="text-center text-neutral-400 text-xs">
              Go Drive Group
            </Text>
            <Text className="text-center text-neutral-400 text-xs mt-1">
              Desenvolvido por: Delta Pro Tecnologia
            </Text>
          </View>
        </View>
      </ScrollView>

    </KeyboardAvoidingView>
  );
}
