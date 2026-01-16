import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, XCircle, Clock, User, Mail, Phone } from 'lucide-react-native';
import { adminService, Instructor } from '@/services/admin';
import { Toast, useToast } from '@/components/ui/Toast';

export default function AdminInstructorsScreen() {
  const { showToast } = useToast();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInstructors();
  }, []);

  async function loadInstructors() {
    try {
      const data = await adminService.getInstructors();
      setInstructors(data);
    } catch (error: any) {
      console.error('Erro ao carregar instrutores:', error);
      showToast('Erro ao carregar instrutores', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApproveInstructor(id: string) {
    console.log('🔍 [FRONTEND] handleApproveInstructor chamado com ID:', id);
    try {
      await adminService.approveInstructor(id);
      showToast('Instrutor aprovado com sucesso', 'success');
      loadInstructors(); // Recarregar lista
    } catch (error: any) {
      console.error('🔍 [FRONTEND] Erro ao aprovar instrutor:', error);
      showToast('Erro ao aprovar instrutor', 'error');
    }
  }

  async function handleRejectInstructor(id: string) {
    console.log('🔍 [FRONTEND] handleRejectInstructor chamado com ID:', id);
    try {
      await adminService.rejectInstructor(id);
      showToast('Instrutor rejeitado com sucesso', 'success');
      loadInstructors(); // Recarregar lista
    } catch (error: any) {
      console.error('🔍 [FRONTEND] Erro ao rejeitar instrutor:', error);
      showToast('Erro ao rejeitar instrutor', 'error');
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDING':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Aprovado';
      case 'PENDING':
        return 'Pendente';
      case 'REJECTED':
        return 'Rejeitado';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle size={16} color="#10B981" />;
      case 'PENDING':
        return <Clock size={16} color="#F59E0B" />;
      case 'REJECTED':
        return <XCircle size={16} color="#EF4444" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50" edges={['bottom']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#DC2626" />
          <Text className="text-neutral-500 mt-4">Carregando instrutores...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          <Text className="text-neutral-900 text-2xl font-bold mb-2">
            Instrutores
          </Text>
          <Text className="text-neutral-500 text-base mb-6">
            Gerencie cadastros de instrutores
          </Text>

          {/* Stats */}
          <View className="flex-row space-x-3 mb-6">
            <View className="flex-1 bg-amber-50 rounded-2xl p-4 border border-amber-200">
              <Text className="text-amber-700 text-sm font-semibold mb-1">Pendentes</Text>
              <Text className="text-amber-900 text-2xl font-bold">
                {instructors?.filter(i => i.status === 'PENDING').length || 0}
              </Text>
            </View>
            
            <View className="flex-1 bg-green-50 rounded-2xl p-4 border border-green-200">
              <Text className="text-green-700 text-sm font-semibold mb-1">Aprovados</Text>
              <Text className="text-green-900 text-2xl font-bold">
                {instructors?.filter(i => i.status === 'APPROVED').length || 0}
              </Text>
            </View>
            
            <View className="flex-1 bg-red-50 rounded-2xl p-4 border border-red-200">
              <Text className="text-red-700 text-sm font-semibold mb-1">Rejeitados</Text>
              <Text className="text-red-900 text-2xl font-bold">
                {instructors?.filter(i => i.status === 'REJECTED').length || 0}
              </Text>
            </View>
          </View>

          {/* Instructors List */}
          <View className="space-y-4">
            {instructors?.map((instructor) => (
              <View key={instructor.id} className="bg-white rounded-2xl p-4 shadow-sm">
                {/* Header */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <User size={20} color="#6B7280" />
                      <Text className="text-neutral-900 font-semibold ml-2">
                        {instructor.name}
                      </Text>
                    </View>
                    
                    <View className={`flex-row items-center px-3 py-1 rounded-full border ${getStatusColor(instructor.status)}`}>
                      {getStatusIcon(instructor.status)}
                      <Text className={`text-xs font-medium ml-1`}>
                        {getStatusText(instructor.status)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Contact Info */}
                <View className="space-y-2 mb-3">
                  <View className="flex-row items-center">
                    <Mail size={16} color="#9CA3AF" />
                    <Text className="text-neutral-600 text-sm ml-2">{instructor.email}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Phone size={16} color="#9CA3AF" />
                    <Text className="text-neutral-600 text-sm ml-2">{instructor.phone}</Text>
                  </View>
                </View>

                {/* Details */}
                <View className="bg-neutral-50 rounded-lg p-3 mb-3">
                  <Text className="text-neutral-700 text-sm mb-1">CNH: {instructor.cnh}</Text>
                  <Text className="text-neutral-700 text-sm">Veículo: {instructor.vehicle}</Text>
                  <Text className="text-neutral-500 text-xs mt-1">
                    Cadastrado em: {instructor.createdAt}
                  </Text>
                </View>

                {/* Actions */}
                {instructor.status === 'PENDING' && (
                  <View className="flex-row space-x-3">
                    <TouchableOpacity 
                      onPress={() => handleApproveInstructor(instructor.id)}
                      className="flex-1 bg-green-500 rounded-xl py-2 px-4 active:scale-95 transition-transform"
                    >
                      <Text className="text-white text-center font-medium text-sm">Aprovar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleRejectInstructor(instructor.id)}
                      className="flex-1 bg-red-500 rounded-xl py-2 px-4 active:scale-95 transition-transform"
                    >
                      <Text className="text-white text-center font-medium text-sm">Rejeitar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
