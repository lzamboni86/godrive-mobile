import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { adminService, Dashboard } from '@/services/admin';
import { Toast, useToast } from '@/components/ui/Toast';

export default function AdminDashboardScreen() {
  const { showToast } = useToast();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const data = await adminService.getDashboard();
      setDashboard(data);
    } catch (error: any) {
      console.error('Erro ao carregar dashboard:', error);
      showToast('Erro ao carregar dashboard', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50" edges={['bottom']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#DC2626" />
          <Text className="text-neutral-500 mt-4">Carregando dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          <Text className="text-neutral-900 text-2xl font-bold mb-2">
            Painel Administrativo
          </Text>
          <Text className="text-neutral-500 text-base mb-6">
            Gerencie a plataforma GoDrive
          </Text>

          {/* Dashboard Cards */}
          <View className="flex-row space-x-3 mb-6">
            <View className="flex-1 bg-red-50 rounded-2xl p-4 border border-red-200">
              <View className="flex-row items-center mb-2">
                <Users size={20} color="#DC2626" />
                <Text className="text-red-700 text-sm font-semibold ml-2">Total Usuários</Text>
              </View>
              <Text className="text-red-900 text-2xl font-bold">{dashboard?.totalUsers || 0}</Text>
              <Text className="text-red-600 text-xs mt-1">Cadastrados</Text>
            </View>
            
            <View className="flex-1 bg-amber-50 rounded-2xl p-4 border border-amber-200">
              <View className="flex-row items-center mb-2">
                <AlertTriangle size={20} color="#F59E0B" />
                <Text className="text-amber-700 text-sm font-semibold ml-2">Pendentes</Text>
              </View>
              <Text className="text-amber-900 text-2xl font-bold">{dashboard?.pendingInstructors || 0}</Text>
              <Text className="text-amber-600 text-xs mt-1">Aprovação</Text>
            </View>
          </View>

          <View className="flex-row space-x-3 mb-6">
            <View className="flex-1 bg-green-50 rounded-2xl p-4 border border-green-200">
              <View className="flex-row items-center mb-2">
                <CheckCircle size={20} color="#10B981" />
                <Text className="text-green-700 text-sm font-semibold ml-2">Aulas Hoje</Text>
              </View>
              <Text className="text-green-900 text-2xl font-bold">{dashboard?.todayLessons || 0}</Text>
              <Text className="text-green-600 text-xs mt-1">Confirmadas</Text>
            </View>
            
            <View className="flex-1 bg-blue-50 rounded-2xl p-4 border border-blue-200">
              <View className="flex-row items-center mb-2">
                <TrendingUp size={20} color="#3B82F6" />
                <Text className="text-blue-700 text-sm font-semibold ml-2">Receita</Text>
              </View>
              <Text className="text-blue-900 text-2xl font-bold">R$ {(dashboard?.revenue || 0).toFixed(1)}k</Text>
              <Text className="text-blue-600 text-xs mt-1">Este mês</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <Text className="text-neutral-900 text-lg font-semibold mb-4">
              Ações Rápidas
            </Text>
            
            <View className="space-y-3">
              <View className="flex-row items-center justify-between p-3 bg-amber-50 rounded-xl">
                <View className="flex-row items-center">
                  <AlertTriangle size={20} color="#F59E0B" />
                  <View className="ml-3">
                    <Text className="text-amber-900 font-medium">Aprovações Pendentes</Text>
                    <Text className="text-amber-700 text-sm">3 instrutores aguardando</Text>
                  </View>
                </View>
                <Text className="text-amber-600 text-sm font-medium">Ver →</Text>
              </View>
              
              <View className="flex-row items-center justify-between p-3 bg-blue-50 rounded-xl">
                <View className="flex-row items-center">
                  <Users size={20} color="#3B82F6" />
                  <View className="ml-3">
                    <Text className="text-blue-900 font-medium">Novos Usuários</Text>
                    <Text className="text-blue-700 text-sm">12 esta semana</Text>
                  </View>
                </View>
                <Text className="text-blue-600 text-sm font-medium">Ver →</Text>
              </View>
            </View>
          </View>

          {/* Recent Activity */}
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <Text className="text-neutral-900 text-lg font-semibold mb-4">
              Atividade Recente
            </Text>
            
            <View className="space-y-3">
              <View className="flex-row items-center justify-between py-2 border-b border-neutral-100">
                <View className="flex-row items-center">
                  <CheckCircle size={16} color="#10B981" />
                  <View className="ml-2">
                    <Text className="text-neutral-900 text-sm font-medium">Novo aluno cadastrado</Text>
                    <Text className="text-neutral-500 text-xs">Luis Silva • há 5 min</Text>
                  </View>
                </View>
              </View>
              
              <View className="flex-row items-center justify-between py-2 border-b border-neutral-100">
                <View className="flex-row items-center">
                  <AlertTriangle size={16} color="#F59E0B" />
                  <View className="ml-2">
                    <Text className="text-neutral-900 text-sm font-medium">Instrutor pendente</Text>
                    <Text className="text-neutral-500 text-xs">João Santos • há 1h</Text>
                  </View>
                </View>
              </View>
              
              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center">
                  <CheckCircle size={16} color="#10B981" />
                  <View className="ml-2">
                    <Text className="text-neutral-900 text-sm font-medium">Aula concluída</Text>
                    <Text className="text-neutral-500 text-xs">Maria Silva • há 2h</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
