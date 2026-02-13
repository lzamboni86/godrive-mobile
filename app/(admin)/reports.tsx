import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Users, UserCheck, DollarSign, FileText, Download, ChevronDown, ChevronUp } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { adminService, StudentsReport, InstructorsReport, FinancialReport, LogsReport } from '@/services/admin';

type ReportType = 'students' | 'instructors' | 'financial' | 'logs';

export default function AdminReportsScreen() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedReport, setExpandedReport] = useState<ReportType | null>(null);
  
  const [studentsReport, setStudentsReport] = useState<StudentsReport | null>(null);
  const [instructorsReport, setInstructorsReport] = useState<InstructorsReport | null>(null);
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null);
  const [logsReport, setLogsReport] = useState<LogsReport | null>(null);

  const filters = { startDate, endDate };

  const toggleReport = async (type: ReportType) => {
    if (expandedReport === type) {
      setExpandedReport(null);
      return;
    }
    await loadReport(type);
  };

  const loadReport = async (type: ReportType) => {
    setIsLoading(true);
    setSelectedReport(type);
    try {
      switch (type) {
        case 'students':
          const students = await adminService.getStudentsReport(filters);
          setStudentsReport(students);
          break;
        case 'instructors':
          const instructors = await adminService.getInstructorsReport(filters);
          setInstructorsReport(instructors);
          break;
        case 'financial':
          const financial = await adminService.getFinancialReport(filters);
          setFinancialReport(financial);
          break;
        case 'logs':
          const logs = await adminService.getLogsReport(filters);
          setLogsReport(logs);
          break;
      }
      setExpandedReport(type);
    } catch (error: any) {
      Alert.alert('Erro', error?.message || 'Não foi possível carregar o relatório');
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = async (type: ReportType) => {
    try {
      const csv = await adminService.exportReportCsv(type, filters);
      const filename = `${type}_${filters.startDate}_${filters.endDate}.csv`;

      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      }

      // Try file-based sharing first
      const fsAny = FileSystem as any;
      const fs = fsAny?.default || fsAny;
      const dirRaw = fs?.cacheDirectory || fs?.documentDirectory;

      if (dirRaw) {
        try {
          const canShare = await Sharing.isAvailableAsync();
          if (canShare) {
            const dir = String(dirRaw).endsWith('/') ? String(dirRaw) : `${dirRaw}/`;
            const fileUri = `${dir}${filename}`;
            const content = `\uFEFF${csv}`;
            const encoding = fs?.EncodingType?.UTF8 || 'utf8';
            await fs.writeAsStringAsync(fileUri, content, { encoding });

            await Sharing.shareAsync(fileUri, {
              mimeType: 'text/csv',
              dialogTitle: filename,
              UTI: 'public.comma-separated-values-text',
            });
            return;
          }
        } catch (fileError) {
          console.warn('File sharing failed, falling back to text share:', fileError);
        }
      }

      // Fallback: use React Native Share with text content
      await Share.share({
        message: csv,
        title: filename,
      });
    } catch (error) {
      Alert.alert('Erro', (error as any)?.message || String(error) || 'Não foi possível exportar o relatório');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const reportTypes = [
    { id: 'students' as ReportType, title: 'Total de Alunos', icon: Users, color: 'blue' },
    { id: 'instructors' as ReportType, title: 'Total de Instrutores', icon: UserCheck, color: 'green' },
    { id: 'financial' as ReportType, title: 'Financeiro Detalhado', icon: DollarSign, color: 'amber' },
    { id: 'logs' as ReportType, title: 'Logs Consolidados', icon: FileText, color: 'purple' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          <Text className="text-neutral-900 text-2xl font-bold mb-2">Relatórios</Text>
          <Text className="text-neutral-500 text-base mb-6">
            Gere relatórios detalhados do sistema
          </Text>

          {/* Seletor de Período */}
          <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
            <View className="flex-row items-center mb-4">
              <Calendar size={20} color="#6B7280" />
              <Text className="text-neutral-700 font-semibold ml-2">Período do Relatório</Text>
            </View>
            
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-neutral-500 text-sm mb-1">Data Início</Text>
                <TouchableOpacity 
                  className="bg-neutral-100 rounded-lg p-3"
                  onPress={() => {
                    // Em produção, usar DateTimePicker
                    Alert.prompt('Data Início', 'Digite a data (YYYY-MM-DD)', [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'OK', onPress: (text?: string) => text && setStartDate(text) }
                    ], 'plain-text', startDate);
                  }}
                >
                  <Text className="text-neutral-900">{formatDate(startDate)}</Text>
                </TouchableOpacity>
              </View>
              
              <View className="flex-1">
                <Text className="text-neutral-500 text-sm mb-1">Data Fim</Text>
                <TouchableOpacity 
                  className="bg-neutral-100 rounded-lg p-3"
                  onPress={() => {
                    Alert.prompt('Data Fim', 'Digite a data (YYYY-MM-DD)', [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'OK', onPress: (text?: string) => text && setEndDate(text) }
                    ], 'plain-text', endDate);
                  }}
                >
                  <Text className="text-neutral-900">{formatDate(endDate)}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Cards de Relatórios */}
          {reportTypes.map((report) => {
            const Icon = report.icon;
            const isExpanded = expandedReport === report.id;
            const colorMap: Record<string, { bg: string; border: string; text: string; icon: string }> = {
              blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: '#3B82F6' },
              green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: '#10B981' },
              amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: '#F59E0B' },
              purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: '#8B5CF6' },
            };
            const colorClasses = colorMap[report.color];

            return (
              <View key={report.id} className="mb-4">
                <TouchableOpacity
                  className={`${colorClasses.bg} border ${colorClasses.border} rounded-2xl p-4`}
                  onPress={() => toggleReport(report.id)}
                  disabled={isLoading}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <Icon size={24} color={colorClasses.icon} />
                      <Text className={`${colorClasses.text} font-semibold ml-3`}>{report.title}</Text>
                    </View>
                    
                    <View className="flex-row items-center">
                      {isLoading && selectedReport === report.id ? (
                        <ActivityIndicator size="small" color={colorClasses.icon} />
                      ) : (
                        <>
                          <TouchableOpacity
                            className="bg-white rounded-lg px-3 py-2 mr-2"
                            onPress={(e) => {
                              // Prevent triggering the parent onPress
                              e?.stopPropagation?.();
                              exportCSV(report.id);
                            }}
                          >
                            <View className="flex-row items-center">
                              <Download size={16} color={colorClasses.icon} />
                              <Text className={`${colorClasses.text} text-sm ml-1`}>CSV</Text>
                            </View>
                          </TouchableOpacity>
                          {isExpanded ? (
                            <ChevronUp size={20} color={colorClasses.icon} />
                          ) : (
                            <ChevronDown size={20} color={colorClasses.icon} />
                          )}
                        </>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Conteúdo Expandido */}
                {isExpanded && (
                  <View className="bg-white rounded-b-2xl p-4 -mt-2 border border-t-0 border-neutral-200">
                    {report.id === 'students' && studentsReport && (
                      <View>
                        <View className="flex-row justify-between mb-4">
                          <View className="flex-1 bg-blue-50 rounded-lg p-3 mr-2">
                            <Text className="text-blue-600 text-sm">Total</Text>
                            <Text className="text-blue-900 text-xl font-bold">{studentsReport.summary.totalStudents}</Text>
                          </View>
                          <View className="flex-1 bg-green-50 rounded-lg p-3">
                            <Text className="text-green-600 text-sm">Novos no Período</Text>
                            <Text className="text-green-900 text-xl font-bold">{studentsReport.summary.newStudentsInPeriod}</Text>
                          </View>
                        </View>
                        <Text className="text-neutral-700 font-medium mb-2">Últimos Cadastros:</Text>
                        {studentsReport.students.slice(0, 5).map((student) => (
                          <View key={student.id} className="flex-row justify-between py-2 border-b border-neutral-100">
                            <Text className="text-neutral-900">{student.name || student.email}</Text>
                            <Text className="text-neutral-500 text-sm">{student.lessonsCount} aulas</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {report.id === 'instructors' && instructorsReport && (
                      <View>
                        <View className="flex-row justify-between mb-4">
                          <View className="flex-1 bg-green-50 rounded-lg p-3 mr-2">
                            <Text className="text-green-600 text-sm">Total</Text>
                            <Text className="text-green-900 text-xl font-bold">{instructorsReport.summary.totalInstructors}</Text>
                          </View>
                          <View className="flex-1 bg-amber-50 rounded-lg p-3">
                            <Text className="text-amber-600 text-sm">Pendentes</Text>
                            <Text className="text-amber-900 text-xl font-bold">{instructorsReport.summary.pendingCount}</Text>
                          </View>
                        </View>
                        <Text className="text-neutral-700 font-medium mb-2">Instrutores:</Text>
                        {instructorsReport.instructors.slice(0, 5).map((instructor) => (
                          <View key={instructor.id} className="flex-row justify-between py-2 border-b border-neutral-100">
                            <Text className="text-neutral-900">{instructor.name}</Text>
                            <Text className={instructor.status === 'APPROVED' ? 'text-green-600' : 'text-amber-600'}>{instructor.status}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {report.id === 'financial' && financialReport && (
                      <View>
                        <View className="flex-row flex-wrap gap-2 mb-4">
                          <View className="flex-1 min-w-[45%] bg-green-50 rounded-lg p-3">
                            <Text className="text-green-600 text-sm">Receita Total</Text>
                            <Text className="text-green-900 text-lg font-bold">{formatCurrency(financialReport.summary.totalReceived)}</Text>
                          </View>
                          <View className="flex-1 min-w-[45%] bg-amber-50 rounded-lg p-3">
                            <Text className="text-amber-600 text-sm">Pendente</Text>
                            <Text className="text-amber-900 text-lg font-bold">{formatCurrency(financialReport.summary.totalPending)}</Text>
                          </View>
                          <View className="flex-1 min-w-[45%] bg-red-50 rounded-lg p-3">
                            <Text className="text-red-600 text-sm">Taxa MP</Text>
                            <Text className="text-red-900 text-lg font-bold">{formatCurrency(financialReport.summary.mercadoPagoFee)}</Text>
                          </View>
                          <View className="flex-1 min-w-[45%] bg-blue-50 rounded-lg p-3">
                            <Text className="text-blue-600 text-sm">Taxa Plataforma</Text>
                            <Text className="text-blue-900 text-lg font-bold">{formatCurrency(financialReport.summary.platformFee)}</Text>
                          </View>
                        </View>
                        <Text className="text-neutral-700 font-medium mb-2">Últimas Transações:</Text>
                        {financialReport.transactions.slice(0, 5).map((tx) => (
                          <View key={tx.id} className="flex-row justify-between py-2 border-b border-neutral-100">
                            <View>
                              <Text className="text-neutral-900">{tx.studentName}</Text>
                              <Text className="text-neutral-500 text-xs">{tx.instructorName}</Text>
                            </View>
                            <Text className="text-green-600 font-medium">{formatCurrency(tx.amount)}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {report.id === 'logs' && logsReport && (
                      <View>
                        <View className="flex-row justify-between mb-4">
                          <View className="flex-1 bg-purple-50 rounded-lg p-3 mr-2">
                            <Text className="text-purple-600 text-sm">Total Logs</Text>
                            <Text className="text-purple-900 text-xl font-bold">{logsReport.summary.totalLogs}</Text>
                          </View>
                          <View className="flex-1 bg-blue-50 rounded-lg p-3">
                            <Text className="text-blue-600 text-sm">Usuários Únicos</Text>
                            <Text className="text-blue-900 text-xl font-bold">{logsReport.summary.uniqueUsers}</Text>
                          </View>
                        </View>
                        <Text className="text-neutral-700 font-medium mb-2">Por Tipo de Ação:</Text>
                        {logsReport.byAction.slice(0, 5).map((action, idx) => (
                          <View key={idx} className="flex-row justify-between py-2 border-b border-neutral-100">
                            <Text className="text-neutral-900">{action.action}</Text>
                            <Text className="text-neutral-500">{action.count}x</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
