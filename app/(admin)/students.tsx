import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, GraduationCap, Calendar, CheckCircle } from 'lucide-react-native';
import { adminService, Student } from '@/services/admin';
import { Toast, useToast } from '@/components/ui/Toast';

export default function AdminStudentsScreen() {
  const { showToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      const data = await adminService.getStudents();
      setStudents(data);
    } catch (error: any) {
      console.error('Erro ao carregar alunos:', error);
      showToast('Erro ao carregar alunos', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50" edges={['bottom']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#DC2626" />
          <Text className="text-neutral-500 mt-4">Carregando alunos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          <Text className="text-neutral-900 text-2xl font-bold mb-2">
            Alunos
          </Text>
          <Text className="text-neutral-500 text-base mb-6">
            Gerencie cadastros de alunos
          </Text>

          {/* Stats */}
          <View className="flex-row space-x-3 mb-6">
            <View className="flex-1 bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
              <Text className="text-emerald-700 text-sm font-semibold mb-1">Total</Text>
              <Text className="text-emerald-900 text-2xl font-bold">{students?.length || 0}</Text>
            </View>
            
            <View className="flex-1 bg-blue-50 rounded-2xl p-4 border border-blue-200">
              <Text className="text-blue-700 text-sm font-semibold mb-1">Ativos</Text>
              <Text className="text-blue-900 text-2xl font-bold">
                {students?.filter(s => s.status === 'ACTIVE').length || 0}
              </Text>
            </View>
            
            <View className="flex-1 bg-amber-50 rounded-2xl p-4 border border-amber-200">
              <Text className="text-amber-700 text-sm font-semibold mb-1">Novos</Text>
              <Text className="text-amber-900 text-2xl font-bold">
                {students?.filter(s => {
                  const createdDate = new Date(s.createdAt);
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return createdDate > thirtyDaysAgo;
                }).length || 0}
              </Text>
            </View>
          </View>

          {/* Students List */}
          <View className="space-y-4">
            {students?.map((student) => (
              <View key={student.id} className="bg-white rounded-2xl p-4 shadow-sm">
                {/* Header */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <GraduationCap size={20} color="#10B981" />
                      <Text className="text-neutral-900 font-semibold ml-2">
                        {student.name}
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200">
                      <CheckCircle size={16} color="#10B981" />
                      <Text className="text-emerald-700 text-xs font-medium ml-1">
                        Ativo
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Contact Info */}
                <View className="space-y-2 mb-3">
                  <View className="flex-row items-center">
                    <Users size={16} color="#9CA3AF" />
                    <Text className="text-neutral-600 text-sm ml-2">{student.email}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Calendar size={16} color="#9CA3AF" />
                    <Text className="text-neutral-600 text-sm ml-2">{student.phone}</Text>
                  </View>
                </View>

                {/* Progress */}
                <View className="bg-neutral-50 rounded-lg p-3">
                  {(() => {
                    const rawTotal = student.totalLessons || 0;
                    const progressTotal = rawTotal === 0 ? 2 : rawTotal;
                    const progressCompleted = Math.max(student.completedLessons || 0, 0);
                    const progressPct = progressTotal > 0 ? Math.min((progressCompleted / progressTotal) * 100, 100) : 0;

                    return (
                      <>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-neutral-700 text-sm font-medium">Progresso</Text>
                    <Text className="text-emerald-600 text-sm font-bold">
                      {progressCompleted}/{progressTotal} aulas
                    </Text>
                  </View>
                  
                  {/* Progress Bar */}
                  <View className="w-full bg-neutral-200 rounded-full h-2">
                    <View 
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ 
                        width: `${progressPct}%` 
                      }}
                    />
                  </View>
                      </>
                    );
                  })()}
                  
                  <Text className="text-neutral-500 text-xs mt-1">
                    Cadastrado em: {student.createdAt}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
