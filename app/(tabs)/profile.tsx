import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, LogOut, Mail, Phone, Award, CreditCard, Edit2, Check, Shield, ChevronRight, Edit, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { instructorService } from '@/services/instructor';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [pixKey, setPixKey] = useState('');
  const [isEditingPix, setIsEditingPix] = useState(false);
  const [tempPixKey, setTempPixKey] = useState('');
  const [lessonPrice, setLessonPrice] = useState(80);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do perfil ao montar o componente
  useEffect(() => {
    loadProfileData();
  }, [user?.id]);

  const loadProfileData = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await instructorService.getProfile(user.id) as { instructor: { pixKey?: string; hourlyRate?: number } };
      const instructor = response.instructor;
      
      if (instructor) {
        setPixKey(instructor.pixKey || '');
        setLessonPrice(instructor.hourlyRate || 80);
      }
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error);
      // Manter valores padrão em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePix = async () => {
    if (!tempPixKey.trim()) {
      Alert.alert('Erro', 'Digite uma chave PIX válida.');
      return;
    }

    try {
      await instructorService.updateProfile({ pixKey: tempPixKey.trim() });
      setPixKey(tempPixKey.trim());
      setIsEditingPix(false);
      Alert.alert('Sucesso', 'Chave PIX atualizada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar PIX:', error);
      Alert.alert('Erro', error.message || 'Não foi possível atualizar a chave PIX.');
    }
  };

  const handleSavePrice = async () => {
    const price = parseFloat(tempPrice);
    if (!price || price <= 0) {
      Alert.alert('Erro', 'Digite um valor válido para a aula.');
      return;
    }

    try {
      await instructorService.updateProfile({ hourlyRate: price });
      setLessonPrice(price);
      setIsEditingPrice(false);
      Alert.alert('Sucesso', `Valor da aula atualizado para R$ ${price.toFixed(2)}!`);
    } catch (error: any) {
      console.error('Erro ao atualizar valor:', error);
      Alert.alert('Erro', error.message || 'Não foi possível atualizar o valor da aula.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top', 'bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6 pb-8">
        {/* Avatar e Nome */}
        <View className="items-center mb-8">
          {isLoading ? (
            <View className="w-32 h-32 rounded-full bg-neutral-200 items-center justify-center mb-4">
              <Text className="text-neutral-400 text-4xl font-bold">...</Text>
            </View>
          ) : (
            user?.avatar ? (
              <Image source={{ uri: user.avatar }} className="w-32 h-32 rounded-full mb-4" />
            ) : (
              <View className="w-32 h-32 rounded-full bg-brand-primary items-center justify-center mb-4">
                <Text className="text-white text-4xl font-bold">
                  {user?.name?.charAt(0) || 'I'}
                </Text>
              </View>
            )
          )}
          <Text className="text-neutral-900 text-xl font-bold text-center">
            {user?.name || 'Instrutor'}
          </Text>
          <View className="flex-row items-center mt-1">
            <Award size={14} color="#10B981" />
            <Text className="text-success-500 text-sm font-medium ml-1">
              Instrutor Verificado
            </Text>
          </View>
        </View>

        {/* Informações */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <Text className="text-neutral-500 text-xs font-medium uppercase mb-3">
            Informações de Contato
          </Text>
          
          <View className="flex-row items-center py-3 border-b border-neutral-100">
            <Mail size={20} color="#6B7280" />
            <View className="ml-3">
              <Text className="text-neutral-400 text-xs">Email</Text>
              <Text className="text-neutral-900 text-base">
                {user?.email || 'instrutor@godrive.com'}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center py-3 border-b border-neutral-100">
            <Phone size={20} color="#6B7280" />
            <View className="ml-3">
              <Text className="text-neutral-400 text-xs">Telefone</Text>
              <Text className="text-neutral-900 text-base">
                {user?.phone || '(11) 99999-9999'}
              </Text>
            </View>
          </View>

          {/* Campo PIX */}
          <View className="py-3 border-b border-neutral-100">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <CreditCard size={20} color="#6B7280" />
                <Text className="text-neutral-400 text-xs ml-3">Chave PIX</Text>
              </View>
              {!isEditingPix && !isLoading && (
                <TouchableOpacity 
                  onPress={() => {
                    setTempPixKey(pixKey);
                    setIsEditingPix(true);
                  }}
                >
                  <Edit2 size={16} color="#10B981" />
                </TouchableOpacity>
              )}
            </View>
            
            {isEditingPix ? (
              <View className="flex-row items-center gap-2">
                <TextInput
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                  value={tempPixKey}
                  onChangeText={setTempPixKey}
                  placeholder="Digite sua chave PIX"
                  placeholderTextColor="#9CA3AF"
                  autoFocus
                />
                <TouchableOpacity 
                  onPress={handleSavePix}
                  className="bg-emerald-500 p-2 rounded-lg"
                >
                  <Check size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setIsEditingPix(false)}
                  className="bg-red-500 p-2 rounded-lg"
                >
                  <Text className="text-white text-xs font-bold">X</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text className="text-neutral-900 text-base">
                {isLoading ? 'Carregando...' : (pixKey || 'Não configurada')}
              </Text>
            )}
          </View>

          {/* Campo Valor da Aula */}
          <View className="py-3">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <CreditCard size={20} color="#6B7280" />
                <Text className="text-neutral-400 text-xs ml-3">Valor da Aula</Text>
              </View>
              {!isEditingPrice && !isLoading && (
                <TouchableOpacity 
                  onPress={() => {
                    setTempPrice(lessonPrice.toString());
                    setIsEditingPrice(true);
                  }}
                >
                  <Edit2 size={16} color="#10B981" />
                </TouchableOpacity>
              )}
            </View>
            
            {isEditingPrice ? (
              <View className="flex-row items-center gap-2">
                <TextInput
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                  value={tempPrice}
                  onChangeText={setTempPrice}
                  placeholder="Digite o valor da aula"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  autoFocus
                />
                <TouchableOpacity 
                  onPress={handleSavePrice}
                  className="bg-emerald-500 p-2 rounded-lg"
                >
                  <Check size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setIsEditingPrice(false)}
                  className="bg-red-500 p-2 rounded-lg"
                >
                  <Text className="text-white text-xs font-bold">X</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text className="text-neutral-900 text-base">
                {isLoading ? 'Carregando...' : `R$ ${lessonPrice.toFixed(2)}`}
              </Text>
            )}
          </View>
        </View>

        {/* Informações PIX */}
        <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4">
          <Text className="text-emerald-900 font-semibold mb-2">Sobre o PIX</Text>
          <Text className="text-emerald-700 text-sm leading-relaxed">
            • Sua chave PIX será usada para receber pagamentos das aulas{'\n'}
            • Você pode usar email, CPF ou telefone como chave{'\n'}
            • Os pagamentos são liberados após conclusão das aulas{'\n'}
            • Mantenha sua chave sempre atualizada
          </Text>
        </View>

        {/* Informações Valor da Aula */}
        <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <Text className="text-blue-900 font-semibold mb-2">Sobre o Valor da Aula</Text>
          <Text className="text-blue-700 text-sm leading-relaxed">
            • O valor definido aqui será usado para novas aulas{'\n'}
            • Você pode ajustar o valor a qualquer momento{'\n'}
            • Alunos verão seu preço ao agendar aulas{'\n'}
            • O valor é por aula (50 minutos de duração)
          </Text>
        </View>

        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <Text className="text-neutral-500 text-xs font-medium uppercase mb-3">
            Conta
          </Text>

          <TouchableOpacity
            className="flex-row items-center py-3 active:bg-neutral-50"
            onPress={() => router.push('/(tabs)/edit-profile')}
          >
            <Edit size={20} color="#6B7280" />
            <View className="ml-3 flex-1">
              <Text className="text-neutral-900 text-base font-medium">Editar Perfil</Text>
              <Text className="text-neutral-500 text-sm">Nome, e-mail, telefone e foto</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-3 active:bg-neutral-50"
            onPress={() => router.push('/delete-account' as any)}
          >
            <Trash2 size={20} color="#DC2626" />
            <View className="ml-3 flex-1">
              <Text className="text-red-600 text-base font-medium">Excluir Conta</Text>
              <Text className="text-neutral-500 text-sm">Remover permanentemente todos os seus dados</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-3 active:bg-neutral-50"
            onPress={() => router.push('/(common)/security-privacy' as any)}
          >
            <Shield size={20} color="#6B7280" />
            <View className="ml-3 flex-1">
              <Text className="text-neutral-900 text-base font-medium">Privacidade e Segurança</Text>
              <Text className="text-neutral-500 text-sm">LGPD, exportação de dados e exclusão de conta</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Botão Logout */}
        <View className="mt-6 mb-8">
          <Button
            title="Sair da Conta"
            onPress={signOut}
            variant="outline"
            fullWidth
            icon={<LogOut size={20} color="#1E3A8A" />}
          />
          <Text className="text-center text-neutral-400 text-xs mt-4">
            GoDrive v1.0.0 • Delta Pro Tecnologia
          </Text>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}
