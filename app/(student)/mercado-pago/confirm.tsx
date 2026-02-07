import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CreditCard, ShieldCheck, Check } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { mercadoPagoService } from '@/services/mercado-pago';
import { useAuth } from '@/contexts/AuthContext';

export default function MercadoPagoConfirmScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const params = useLocalSearchParams<{
    amount?: string;
    externalReference?: string;
    token?: string;
    paymentMethodId?: string;
    issuerId?: string;
    installments?: string;
    deviceId?: string;
  }>();

  const amount = useMemo(() => {
    const raw = (params.amount || '').toString();
    const value = Number(raw);
    return Number.isFinite(value) ? value : 0;
  }, [params.amount]);

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleContinue = useCallback(async () => {
    const token = (params.token || '').toString();
    const paymentMethodId = (params.paymentMethodId || '').toString();
    const issuerId = (params.issuerId || '').toString();
    const installmentsRaw = (params.installments || '').toString();
    const installments = Number(installmentsRaw);
    const deviceId = (params.deviceId || '').toString();
    const externalReference = (params.externalReference || '').toString();

    if (!token || !paymentMethodId || !issuerId || !Number.isFinite(installments) || installments <= 0 || amount <= 0) {
      Alert.alert('Pagamento', 'Dados insuficientes para confirmar o pagamento. Volte e tente novamente.');
      return;
    }

    setIsLoading(true);
    try {
      const payment = await mercadoPagoService.confirmCardPayment({
        amount,
        token,
        paymentMethodId,
        issuerId,
        installments,
        deviceId: deviceId || undefined,
        externalReference: externalReference || undefined,
        description: 'Pagamento GoDrive',
        payerEmail: user?.email,
        payerName: user?.name,
        payerDocumentType: user?.cpf ? 'CPF' : undefined,
        payerDocumentNumber: user?.cpf,
      });

      const status = String(payment?.status || '').toLowerCase();
      if (status === 'approved') {
        router.replace('/(student)/schedule/success' as any);
        return;
      }

      if (status === 'pending' || status === 'in_process') {
        router.replace('/(student)/schedule/pending' as any);
        return;
      }

      router.replace('/(student)/schedule/failure' as any);
    } catch (e: any) {
      Alert.alert('Pagamento', e?.message || 'Não foi possível confirmar o pagamento.');
      router.replace('/(student)/schedule/failure' as any);
    } finally {
      setIsLoading(false);
    }
  }, [amount, params.deviceId, params.externalReference, params.installments, params.issuerId, params.paymentMethodId, params.token, user?.cpf, user?.email, user?.name, setIsLoading]);

  const formatBrl = (value: number) =>
    value
      .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      .replace(/\u00A0/g, ' ');

  const lessonCount = useMemo(() => {
    const ref = params.externalReference ? String(params.externalReference) : '';
    const ids = ref.split(',').filter(Boolean);
    return ids.length || 1;
  }, [params.externalReference]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between p-4 border-b border-neutral-100">
          <TouchableOpacity onPress={handleBack}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-neutral-900">Confirmar pagamento</Text>
          <View className="w-6" />
        </View>

        <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingVertical: 16 }}>
          <View className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6">
            <View className="flex-row items-start">
              <ShieldCheck size={20} color="#00BFA5" />
              <View className="ml-3 flex-1">
                <Text className="text-[#009EE3] font-semibold mb-1">Pagamento seguro</Text>
                <Text className="text-teal-700 text-sm">
                  Seus dados do cartão estão protegidos por criptografia e não são armazenados.
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 mb-6">
            <Text className="text-neutral-900 font-semibold mb-3">Resumo da compra</Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-neutral-600 text-sm">{lessonCount} {lessonCount === 1 ? 'aula' : 'aulas'}</Text>
                <Text className="text-neutral-900 font-semibold">{formatBrl(amount)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-neutral-600 text-sm">Parcelas</Text>
                <Text className="text-neutral-900">{(params.installments || '').toString() || '1'}x</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-neutral-600 text-sm">Bandeira</Text>
                <Text className="text-neutral-900 capitalize">{(params.paymentMethodId || '').toString() || '-'}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            className="bg-[#00BFA5] rounded-2xl h-16 disabled:opacity-60 disabled:cursor-default active:scale-[0.98] transition-all"
            onPress={handleContinue}
            disabled={isLoading}
          >
            <View className="flex-row items-center justify-center h-full px-4">
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <CreditCard size={20} color="#FFFFFF" />
              )}
              <Text className="text-white font-semibold text-lg ml-3">
                {isLoading ? 'Processando...' : 'Confirmar pagamento'}
              </Text>
            </View>
          </TouchableOpacity>

          <View className="mt-4 items-center">
            <View className="flex-row items-center">
              <Check size={16} color="#6B7280" />
              <Text className="text-neutral-500 text-xs ml-1">Pagamento processado pelo Mercado Pago</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
