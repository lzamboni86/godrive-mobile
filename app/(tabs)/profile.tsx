import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, Phone, Award, CreditCard } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { instructorService } from '@/services/instructor';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [pixKey, setPixKey] = useState('');
  const [lessonPrice, setLessonPrice] = useState(80);
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do perfil ao montar o componente
  useEffect(() => {
    loadProfileData();
  }, [user?.id]);

  const loadProfileData = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await instructorService.getProfile(user.id) as { instructor: { pixKey?: string; hourlyRate?: number; bio?: string } };
      const instructor = response.instructor;
      
      if (instructor) {
        setPixKey(instructor.pixKey || '');
        setLessonPrice(instructor.hourlyRate || 80);
        setBio(instructor.bio || '');
      }
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error);
      // Manter valores padrão em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top', 'bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6 pt-8 pb-8">
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

        {/* Bio */}
        {bio && (
          <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
            <Text className="text-neutral-500 text-xs font-medium uppercase mb-3">
              Sobre Mim
            </Text>
            <Text className="text-neutral-700 text-base leading-relaxed">
              {bio}
            </Text>
          </View>
        )}

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
            <View className="flex-row items-center mb-2">
              <View className="flex-row items-center">
                <CreditCard size={20} color="#6B7280" />
                <Text className="text-neutral-400 text-xs ml-3">Chave PIX</Text>
              </View>
            </View>
            <Text className="text-neutral-900 text-base">
              {isLoading ? 'Carregando...' : (pixKey || 'Não configurada')}
            </Text>
          </View>

          {/* Campo Valor da Aula */}
          <View className="py-3">
            <View className="flex-row items-center mb-2">
              <View className="flex-row items-center">
                <CreditCard size={20} color="#6B7280" />
                <Text className="text-neutral-400 text-xs ml-3">Valor da Aula</Text>
              </View>
            </View>
            <Text className="text-neutral-900 text-base">
              {isLoading ? 'Carregando...' : `R$ ${lessonPrice.toFixed(2)}`}
            </Text>
          </View>
        </View>

        {/* Informações PIX */}
        <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4">
          <Text className="text-emerald-900 font-semibold mb-2">Sobre o PIX</Text>
          <Text className="text-emerald-700 text-sm leading-relaxed">
            • Sua chave PIX será usada para receber pagamentos das aulas{'\n'}
            • Para alterar a chave PIX, vá em "Configurações"{'\n'}
            • Os pagamentos são liberados após conclusão das aulas{'\n'}
            • Mantenha sua chave sempre atualizada
          </Text>
        </View>

        {/* Informações Valor da Aula */}
        <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <Text className="text-blue-900 font-semibold mb-2">Sobre o Valor da Aula</Text>
          <Text className="text-blue-700 text-sm leading-relaxed">
            • O valor definido aqui é usado para novas aulas{'\n'}
            • Para alterar o valor, vá em "Configurações"{'\n'}
            • Alunos verão seu preço ao agendar aulas{'\n'}
            • O valor é por aula (50 minutos de duração)
          </Text>
        </View>

        {/* Footer */}
        <View className="mt-6 mb-8">
          <Text className="text-center text-neutral-400 text-xs">
            GoDrive v1.0.0 • Delta Pro Tecnologia
          </Text>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}
