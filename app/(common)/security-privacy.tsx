import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Linking, 
  Modal,
  ActivityIndicator,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Shield, 
  MapPin, 
  FileText, 
  Trash2, 
  ExternalLink,
  AlertTriangle,
  Lock,
  Download,
  ChevronRight
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

export default function SecurityPrivacyScreen() {
  const { user, signOut } = useAuth();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const openLocationSettings = async () => {
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
    } else {
      await Linking.openSettings();
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const response = await api.post<{ message?: string }>('/users/me/export-data');
      Alert.alert(
        'Solicitação Enviada',
        response?.message || 'Sua solicitação de exportação de dados foi registrada. Você receberá um e-mail com seus dados em até 15 dias úteis, conforme a LGPD.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Erro ao solicitar exportação:', error);
      Alert.alert(
        'Erro',
        error?.message || 'Não foi possível processar sua solicitação. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      const response = await api.delete<{ message?: string }>('/users/me');
      setIsDeleteModalVisible(false);
      Alert.alert(
        'Conta Excluída',
        response?.message || 'Processo confirmado. Sua conta foi excluída e seus dados foram anonimizados conforme a LGPD.',
        [{ text: 'OK', onPress: () => signOut() }]
      );
    } catch (error: any) {
      console.error('Erro ao excluir conta:', error);
      setIsDeleteModalVisible(false);
      
      if (error?.statusCode === 400) {
        Alert.alert(
          'Não foi possível excluir',
          error?.message || 'Você possui aulas pendentes ou valores retidos. Finalize todos os serviços antes de excluir sua conta.',
          [{ text: 'Entendi' }]
        );
      } else {
        Alert.alert(
          'Erro',
          error?.message || 'Não foi possível excluir sua conta. Tente novamente mais tarde.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 bg-white border-b border-neutral-100">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-neutral-900">Privacidade e Segurança</Text>
          <View className="w-6" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-4">
            {/* Header Info */}
            <View className="bg-gradient-to-r from-[#00AED5] to-[#8B5CF6] rounded-2xl p-5 mb-6">
              <View className="flex-row items-center">
                <View className="w-14 h-14 bg-white/20 rounded-full items-center justify-center mr-4">
                  <Shield size={28} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg">Seus dados estão protegidos</Text>
                  <Text className="text-white/80 text-sm mt-1">
                    Conformidade com a LGPD
                  </Text>
                </View>
              </View>
            </View>

            {/* Configurações de Privacidade */}
            <Text className="text-neutral-500 text-sm font-medium mb-3 uppercase">
              Configurações de Privacidade
            </Text>
            
            <View className="bg-white rounded-2xl mb-6 shadow-sm overflow-hidden">
              {/* Localização */}
              <TouchableOpacity 
                className="flex-row items-center p-4 border-b border-neutral-100 active:bg-neutral-50"
                onPress={openLocationSettings}
              >
                <View className="w-10 h-10 bg-[#00AED5]/10 rounded-full items-center justify-center">
                  <MapPin size={20} color="#00AED5" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-neutral-900 font-medium">Permissões de Localização</Text>
                  <Text className="text-neutral-500 text-sm">Gerenciar acesso à localização</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>

              {/* Exportar Dados */}
              <TouchableOpacity 
                className="flex-row items-center p-4 border-b border-neutral-100 active:bg-neutral-50"
                onPress={handleExportData}
                disabled={isExporting}
              >
                <View className="w-10 h-10 bg-[#8B5CF6]/10 rounded-full items-center justify-center">
                  {isExporting ? (
                    <ActivityIndicator size="small" color="#8B5CF6" />
                  ) : (
                    <Download size={20} color="#8B5CF6" />
                  )}
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-neutral-900 font-medium">Solicitar Relatório de Dados</Text>
                  <Text className="text-neutral-500 text-sm">Exportar todos os seus dados (LGPD)</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>

              {/* Excluir Conta */}
              <TouchableOpacity 
                className="flex-row items-center p-4 active:bg-red-50"
                onPress={() => setIsDeleteModalVisible(true)}
              >
                <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center">
                  <Trash2 size={20} color="#DC2626" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-red-600 font-medium">Excluir Minha Conta</Text>
                  <Text className="text-neutral-500 text-sm">Remover permanentemente sua conta</Text>
                </View>
                <ChevronRight size={20} color="#DC2626" />
              </TouchableOpacity>
            </View>

            {/* Links Legais */}
            <Text className="text-neutral-500 text-sm font-medium mb-3 uppercase">
              Documentos Legais
            </Text>
            
            <View className="bg-white rounded-2xl mb-6 shadow-sm overflow-hidden">
              <TouchableOpacity 
                className="flex-row items-center p-4 border-b border-neutral-100 active:bg-neutral-50"
                onPress={() => Linking.openURL('https://www.godrivegroup.com.br/politica-privacidade')}
              >
                <View className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center">
                  <Lock size={20} color="#6B7280" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-neutral-900 font-medium">Política de Privacidade</Text>
                  <Text className="text-neutral-500 text-sm">Como tratamos seus dados</Text>
                </View>
                <ExternalLink size={18} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-row items-center p-4 active:bg-neutral-50"
                onPress={() => Linking.openURL('https://www.godrivegroup.com.br/termos-condicoes-uso')}
              >
                <View className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center">
                  <FileText size={20} color="#6B7280" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-neutral-900 font-medium">Termos de Uso</Text>
                  <Text className="text-neutral-500 text-sm">Condições de utilização do app</Text>
                </View>
                <ExternalLink size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Informações de Segurança */}
            <View className="bg-[#00AED5]/5 rounded-2xl p-4 mb-6">
              <View className="flex-row items-start">
                <Shield size={20} color="#00AED5" />
                <View className="flex-1 ml-3">
                  <Text className="text-[#00AED5] font-semibold mb-1">Segurança dos seus dados</Text>
                  <Text className="text-neutral-600 text-sm leading-relaxed">
                    Utilizamos criptografia de ponta a ponta e seguimos as melhores práticas 
                    de segurança para proteger suas informações pessoais.
                  </Text>
                </View>
              </View>
            </View>

            {/* Versão */}
            <View className="items-center py-4">
              <Text className="text-neutral-400 text-sm">
                Versão do App: v1.0.5
              </Text>
              <Text className="text-neutral-400 text-xs mt-1">
                Go Drive Group
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        visible={isDeleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <View className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
            {/* Header do Modal */}
            <View className="bg-red-500 p-6 items-center">
              <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center mb-3">
                <AlertTriangle size={32} color="#FFFFFF" />
              </View>
              <Text className="text-white text-xl font-bold text-center">
                Excluir Conta
              </Text>
            </View>

            {/* Conteúdo */}
            <View className="p-6">
              <Text className="text-neutral-900 font-semibold text-lg mb-3 text-center">
                Tem certeza que deseja excluir sua conta?
              </Text>
              
              <Text className="text-neutral-600 text-sm mb-4 text-center">
                Esta ação é irreversível. Ao excluir sua conta:
              </Text>

              <View className="bg-red-50 rounded-xl p-4 mb-4">
                <View className="flex-row items-start mb-2">
                  <Text className="text-red-600 mr-2">•</Text>
                  <Text className="text-red-700 text-sm flex-1">
                    Todos os seus dados pessoais serão anonimizados
                  </Text>
                </View>
                <View className="flex-row items-start mb-2">
                  <Text className="text-red-600 mr-2">•</Text>
                  <Text className="text-red-700 text-sm flex-1">
                    Você perderá acesso ao histórico de aulas
                  </Text>
                </View>
                <View className="flex-row items-start mb-2">
                  <Text className="text-red-600 mr-2">•</Text>
                  <Text className="text-red-700 text-sm flex-1">
                    Avaliações e comentários serão desvinculados
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <Text className="text-red-600 mr-2">•</Text>
                  <Text className="text-red-700 text-sm flex-1">
                    Não será possível recuperar a conta
                  </Text>
                </View>
              </View>

              <Text className="text-neutral-500 text-xs text-center mb-4">
                Conforme a LGPD, seus dados serão anonimizados e não poderão ser recuperados.
              </Text>

              {/* Botões */}
              <View className="space-y-3">
                <TouchableOpacity
                  className="bg-red-500 rounded-xl p-4 items-center active:bg-red-600"
                  onPress={handleDeleteAccount}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-semibold">Sim, excluir minha conta</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-neutral-100 rounded-xl p-4 items-center active:bg-neutral-200"
                  onPress={() => setIsDeleteModalVisible(false)}
                  disabled={isLoading}
                >
                  <Text className="text-neutral-700 font-semibold">Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
