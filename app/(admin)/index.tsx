import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, TrendingUp, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { adminService, Dashboard } from '@/services/admin';
import { Toast, useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';

// Função para formatar tempo relativo
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `há ${diffMins} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  return `há ${diffDays}d`;
}

export default function AdminDashboardScreen() {
  const { showToast } = useToast();
  const { isLoading: authLoading, isAuthenticated, isAdmin, isInstructor } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.replace('/(auth)/login');
      return;
    }

    if (!isAdmin) {
      router.replace(isInstructor ? '/(tabs)' : ('/(student)' as any));
      return;
    }

    loadDashboard();
  }, [authLoading, isAuthenticated, isAdmin, isInstructor]);

  async function loadDashboard() {
    try {
      const [data, financialReport] = await Promise.all([
        adminService.getDashboard(),
        adminService.getFinancialReport({
          startDate: new Date(new Date().getFullYear(), 0, 1).toISOString(),
          endDate: new Date().toISOString(),
        }),
      ]);
      
      setDashboard(data);

      // Calculate monthRevenue same as finance screen
      const isPaymentReceivedStatus = (status: string) => {
        const s = String(status || '').toUpperCase();
        return s === 'PAID' || s === 'RELEASED';
      };

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const calculatedMonthRevenue = financialReport.transactions
        .filter((t) => {
          const date = new Date(t.createdAt);
          return isPaymentReceivedStatus(t.status) && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, t) => {
          const afterMP = t.amount * 0.9;
          const appCommission = afterMP * 0.12;
          return sum + appCommission;
        }, 0);
      
      setMonthRevenue(calculatedMonthRevenue);
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
              <Text className="text-blue-900 text-2xl font-bold">
                {monthRevenue >= 1000 
                  ? `R$ ${(monthRevenue / 1000).toFixed(1).replace('.', ',')}k`
                  : `R$ ${monthRevenue.toFixed(2).replace('.', ',')}`}
              </Text>
              <Text className="text-blue-600 text-xs mt-1">Este mês</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <Text className="text-neutral-900 text-lg font-semibold mb-4">
              Ações Rápidas
            </Text>
            
            <View className="space-y-3">
              <TouchableOpacity 
                className="flex-row items-center justify-between p-3 bg-amber-50 rounded-xl active:scale-95 transition-transform"
                onPress={() => router.push('/(admin)/instructors')}
              >
                <View className="flex-row items-center">
                  <AlertTriangle size={20} color="#F59E0B" />
                  <View className="ml-3">
                    <Text className="text-amber-900 font-medium">Aprovações Pendentes</Text>
                    <Text className="text-amber-700 text-sm">{dashboard?.pendingInstructors || 0} instrutores aguardando</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#F59E0B" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-row items-center justify-between p-3 bg-blue-50 rounded-xl active:scale-95 transition-transform"
                onPress={() => router.push('/(admin)/students')}
              >
                <View className="flex-row items-center">
                  <Users size={20} color="#3B82F6" />
                  <View className="ml-3">
                    <Text className="text-blue-900 font-medium">Novos Usuários</Text>
                    <Text className="text-blue-700 text-sm">{dashboard?.totalUsers || 0} cadastrados</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Activity */}
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            <Text className="text-neutral-900 text-lg font-semibold mb-4">
              Atividades
            </Text>
            
            {dashboard?.recentActivities && dashboard.recentActivities.length > 0 ? (
              <View className="space-y-3">
                {dashboard.recentActivities.map((activity: any) => (
                  <View key={activity.id} className="flex-row items-center justify-between py-2 border-b border-neutral-100">
                    <View className="flex-row items-center">
                      {activity.type === 'USER_REGISTERED' || activity.type === 'LESSON_COMPLETED' ? (
                        <CheckCircle size={16} color="#10B981" />
                      ) : activity.type === 'INSTRUCTOR_PENDING' ? (
                        <AlertTriangle size={16} color="#F59E0B" />
                      ) : activity.type === 'INSTRUCTOR_APPROVED' ? (
                        <CheckCircle size={16} color="#10B981" />
                      ) : (
                        <AlertTriangle size={16} color="#EF4444" />
                      )}
                      <View className="ml-2">
                        <Text className="text-neutral-900 text-sm font-medium">{activity.description}</Text>
                        <Text className="text-neutral-500 text-xs">
                          {activity.userName} • {formatTimeAgo(activity.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center py-8">
                <Text className="text-neutral-400 text-sm">Nenhuma atividade recente</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
