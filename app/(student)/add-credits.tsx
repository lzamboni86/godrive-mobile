import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CreditCard, DollarSign, CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { mercadoPagoService } from '@/services/mercado-pago';
import { walletService } from '@/services/wallet';
import * as WebBrowser from 'expo-web-browser';

const PRESET_AMOUNTS = [
  { amount: 50, label: 'R$ 50', description: '1 aula prática' },
  { amount: 100, label: 'R$ 100', description: '2 aulas práticas' },
  { amount: 150, label: 'R$ 150', description: '3 aulas práticas' },
  { amount: 250, label: 'R$ 250', description: '5 aulas práticas' },
  { amount: 500, label: 'R$ 500', description: '10 aulas práticas' },
];

export default function AddCreditsScreen() {
  const { user } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (text: string) => {
    // Apenas números e ponto decimal
    const cleaned = text.replace(/[^0-9.]/g, '');
    // Garantir apenas um ponto decimal
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      setCustomAmount(parts[0] + '.' + parts.slice(1).join(''));
    } else {
      setCustomAmount(cleaned);
    }
    setSelectedAmount(null);
  };

  const getPaymentAmount = (): number => {
    if (selectedAmount) return selectedAmount;
    const custom = parseFloat(customAmount);
    return isNaN(custom) ? 0 : custom;
  };

  const validateAmount = (): boolean => {
    const amount = getPaymentAmount();
    return amount >= 10 && amount <= 1000; // Mínimo R$ 10, máximo R$ 1000
  };

  const handlePayment = async () => {
    const amount = getPaymentAmount();
    
    if (!validateAmount()) {
      Alert.alert('Valor Inválido', 'O valor deve estar entre R$ 10 e R$ 1.000');
      return;
    }

    if (!user?.email) {
      Alert.alert('Erro', 'Usuário não identificado. Faça login novamente.');
      return;
    }

    try {
      setIsProcessing(true);
      console.log('💳 [ADD-CREDITS] Iniciando pagamento de R$', amount);

      // Criar preferência no Mercado Pago
      const preference = await mercadoPagoService.createPreference({
        amount,
        description: `Recarga de créditos - R$ ${amount.toFixed(2)}`,
        externalReference: `wallet_credit_${user.id}_${Date.now()}`,
        payerEmail: user.email,
        payerName: user.name,
        items: [{
          id: `credit_${amount}`,
          title: 'Recarga de Créditos GoDrive',
          description: `Adicionar R$ ${amount.toFixed(2)} à carteira`,
          quantity: 1,
          unitPrice: amount,
          currencyId: 'BRL'
        }]
      });

      console.log('💳 [ADD-CREDITS] Preferência criada:', preference.id);

      // Abrir checkout do Mercado Pago
      const url = preference.sandboxInitPoint || preference.initPoint;
      await WebBrowser.openBrowserAsync(url);

      // O webhook vai processar o pagamento e criar a transação na carteira
      Alert.alert(
        'Pagamento Iniciado',
        'Você será redirecionado para o Mercado Pago. Após o pagamento, os créditos serão adicionados à sua carteira.',
        [{ text: 'OK' }]
      );

    } catch (error: any) {
      console.error('💳 [ADD-CREDITS] Erro no pagamento:', error);
      Alert.alert(
        'Erro no Pagamento',
        'Não foi possível processar seu pagamento. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
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
          <Text className="text-lg font-semibold text-neutral-900">Adicionar Créditos</Text>
          <View className="w-6" />
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Informações */}
          <View className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
            <View className="flex-row items-start">
              <CreditCard size={20} color="#10B981" />
              <View className="ml-3 flex-1">
                <Text className="text-emerald-900 font-semibold mb-1">Pagamento Seguro</Text>
                <Text className="text-emerald-700 text-sm">
                  Adicione créditos à sua carteira usando o Mercado Pago. Os créditos ficam disponíveis imediatamente após o pagamento.
                </Text>
              </View>
            </View>
          </View>

          {/* Valores Predefinidos */}
          <View className="mb-6">
            <Text className="text-neutral-900 text-lg font-semibold mb-4">Escolha um valor</Text>
            <View className="grid grid-cols-2 gap-3">
              {PRESET_AMOUNTS.map((preset) => (
                <TouchableOpacity
                  key={preset.amount}
                  className={`border-2 rounded-xl p-4 ${
                    selectedAmount === preset.amount
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-neutral-200 bg-white'
                  }`}
                  onPress={() => handleAmountSelect(preset.amount)}
                >
                  <Text className={`text-lg font-bold mb-1 ${
                    selectedAmount === preset.amount ? 'text-emerald-600' : 'text-neutral-900'
                  }`}>
                    {preset.label}
                  </Text>
                  <Text className={`text-sm ${
                    selectedAmount === preset.amount ? 'text-emerald-700' : 'text-neutral-600'
                  }`}>
                    {preset.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Valor Customizado */}
          <View className="mb-6">
            <Text className="text-neutral-900 text-lg font-semibold mb-4">Ou digite um valor</Text>
            <View className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
              <View className="flex-row items-center">
                <DollarSign size={20} color="#6B7280" />
                <Text className="text-neutral-900 text-lg ml-2">R$</Text>
                <TextInput
                  className="flex-1 text-neutral-900 text-lg ml-2"
                  value={customAmount}
                  onChangeText={handleCustomAmountChange}
                  placeholder="0,00"
                  keyboardType="numeric"
                />
              </View>
              <Text className="text-neutral-500 text-xs mt-2">
                Mínimo: R$ 10 | Máximo: R$ 1.000
              </Text>
            </View>
          </View>

          {/* Resumo */}
          {getPaymentAmount() > 0 && (
            <View className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
              <View className="flex-row items-center justify-between">
                <Text className="text-emerald-900 font-semibold">Valor a pagar:</Text>
                <Text className="text-emerald-600 font-bold text-xl">
                  R$ {getPaymentAmount().toFixed(2)}
                </Text>
              </View>
              <View className="mt-2 pt-2 border-t border-emerald-300">
                <Text className="text-emerald-700 text-sm">
                  ✓ Créditos adicionados à carteira após pagamento
                </Text>
                <Text className="text-emerald-700 text-sm">
                  ✓ Use para reservar aulas com qualquer instrutor
                </Text>
                <Text className="text-emerald-700 text-sm">
                  ✓ Saldo bloqueado até confirmação do instrutor
                </Text>
              </View>
            </View>
          )}

          {/* Botão de Pagamento */}
          <TouchableOpacity
            className={`rounded-xl p-4 flex-row items-center justify-center ${
              getPaymentAmount() > 0 && validateAmount()
                ? 'bg-emerald-500'
                : 'bg-neutral-300'
            }`}
            onPress={handlePayment}
            disabled={getPaymentAmount() === 0 || !validateAmount() || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <CreditCard size={20} color="#FFFFFF" />
            )}
            <Text className="text-white font-semibold ml-2">
              {isProcessing ? 'Processando...' : 'Pagar com Mercado Pago'}
            </Text>
          </TouchableOpacity>

          {/* Informações Adicionais */}
          <View className="mt-6 p-4 bg-neutral-50 rounded-xl">
            <Text className="text-neutral-600 text-sm text-center">
              Ao clicar em "Pagar", você será redirecionado ao ambiente seguro do Mercado Pago para finalizar a transação.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
