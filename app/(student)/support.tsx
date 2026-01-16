import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageCircle, Phone, Mail, Clock, HelpCircle, FileText, Send, AlertCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { studentService, ContactForm } from '@/services/student';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentSupportScreen() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ContactForm>({
    name: user?.name || '',
    email: user?.email || '',
    message: '',
    contactPreference: 'whatsapp'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.message.trim()) {
      Alert.alert('Erro', 'Por favor, descreva sua dúvida ou problema.');
      return;
    }

    try {
      setIsSubmitting(true);
      await studentService.sendContactForm(formData);
      Alert.alert(
        'Sucesso!',
        'Sua mensagem foi enviada. Entraremos em contato em breve.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert(
        'Erro',
        'Não foi possível enviar sua mensagem. Tente novamente.',
        [{ text: 'OK' }]
      );
      console.error('Erro ao enviar formulário:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-neutral-100">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-neutral-900">SAC</Text>
          <View className="w-6" />
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          <Text className="text-neutral-600 mb-6">
            Estamos aqui para ajudar! Envie sua dúvida ou problema através do formulário abaixo.
          </Text>

          {/* Formulário de Contato */}
          <View className="bg-neutral-50 rounded-2xl p-6 mb-6">
            <Text className="text-lg font-semibold text-neutral-900 mb-4">Formulário de Contato</Text>
            
            {/* Nome */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-neutral-700 mb-2">Nome</Text>
              <TextInput
                className="bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Seu nome completo"
                editable={false}
              />
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-neutral-700 mb-2">E-mail</Text>
              <TextInput
                className="bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="seu@email.com"
                editable={false}
              />
            </View>

            {/* Mensagem */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-neutral-700 mb-2">Descreva sua dúvida ou problema *</Text>
              <TextInput
                className="bg-white border border-neutral-300 rounded-xl px-4 py-3 text-neutral-900 min-h-[120px]"
                value={formData.message}
                onChangeText={(text) => setFormData({ ...formData, message: text })}
                placeholder="Detalhe sua dúvida, problema ou sugestão..."
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Preferência de Contato */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-neutral-700 mb-2">Preferência de Contato</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className={`flex-1 flex-row items-center justify-center px-4 py-3 rounded-xl border ${
                    formData.contactPreference === 'whatsapp'
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'bg-white border-neutral-300'
                  }`}
                  onPress={() => setFormData({ ...formData, contactPreference: 'whatsapp' })}
                >
                  <MessageCircle size={20} color={formData.contactPreference === 'whatsapp' ? '#FFFFFF' : '#10B981'} />
                  <Text className={`ml-2 font-medium ${
                    formData.contactPreference === 'whatsapp' ? 'text-white' : 'text-neutral-700'
                  }`}>
                    WhatsApp
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className={`flex-1 flex-row items-center justify-center px-4 py-3 rounded-xl border ${
                    formData.contactPreference === 'email'
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-white border-neutral-300'
                  }`}
                  onPress={() => setFormData({ ...formData, contactPreference: 'email' })}
                >
                  <Mail size={20} color={formData.contactPreference === 'email' ? '#FFFFFF' : '#3B82F6'} />
                  <Text className={`ml-2 font-medium ${
                    formData.contactPreference === 'email' ? 'text-white' : 'text-neutral-700'
                  }`}>
                    E-mail
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Botão Enviar */}
            <TouchableOpacity
              className="bg-emerald-500 rounded-xl p-4 flex-row items-center justify-center"
              onPress={handleSubmit}
              disabled={isSubmitting || !formData.message.trim()}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Send size={20} color="#FFFFFF" />
              )}
              <Text className="text-white font-semibold ml-2">
                {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Canais de Atendimento */}
          <View className="space-y-4 mb-6">
            <TouchableOpacity className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-emerald-500 rounded-full items-center justify-center mr-4">
                  <MessageCircle size={24} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-emerald-900 font-semibold">Chat Online</Text>
                  <Text className="text-emerald-700 text-sm">Atendimento imediato</Text>
                </View>
                <View className="bg-emerald-500 px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-medium">Online</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center mr-4">
                  <Phone size={24} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-blue-900 font-semibold">Telefone</Text>
                  <Text className="text-blue-700 text-sm">(11) 99999-9999</Text>
                </View>
                <View className="bg-blue-500 px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-medium">Ligar</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-purple-500 rounded-full items-center justify-center mr-4">
                  <Mail size={24} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-purple-900 font-semibold">E-mail</Text>
                  <Text className="text-purple-700 text-sm">contato@godrivegroup.com.br</Text>
                </View>
                <View className="bg-purple-500 px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-medium">Enviar</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Horário de Atendimento */}
          <View className="bg-neutral-50 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center mb-3">
              <Clock size={20} color="#6B7280" />
              <Text className="text-neutral-900 font-semibold ml-2">Horário de Atendimento</Text>
            </View>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-neutral-600">Segunda a Sexta</Text>
                <Text className="text-neutral-900 font-medium">08:00 - 18:00</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-neutral-600">Sábado</Text>
                <Text className="text-neutral-900 font-medium">08:00 - 12:00</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-neutral-600">Domingo</Text>
                <Text className="text-neutral-900 font-medium">Fechado</Text>
              </View>
            </View>
          </View>

          {/* Ajuda Rápida */}
          <View>
            <Text className="text-lg font-semibold text-neutral-900 mb-4">Ajuda Rápida</Text>
            <View className="space-y-3">
              <TouchableOpacity className="bg-white border border-neutral-200 rounded-xl p-4">
                <View className="flex-row items-center">
                  <HelpCircle size={20} color="#6B7280" />
                  <Text className="text-neutral-900 font-medium ml-3">Perguntas Frequentes</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity className="bg-white border border-neutral-200 rounded-xl p-4">
                <View className="flex-row items-center">
                  <FileText size={20} color="#6B7280" />
                  <Text className="text-neutral-900 font-medium ml-3">Manual do Aluno</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity className="bg-white border border-neutral-200 rounded-xl p-4">
                <View className="flex-row items-center">
                  <MessageCircle size={20} color="#6B7280" />
                  <Text className="text-neutral-900 font-medium ml-3">Reportar Problema</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
