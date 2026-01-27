import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { API_BASE_URL } from '@/services/api';
import api from '@/services/api';

type MpMessage =
  | { type: 'MP_READY' }
  | { type: 'MP_DEVICE_ID'; deviceId?: string }
  | { type: 'MP_PIX_CREATE'; amount?: string; externalReference?: string; deviceId?: string | null }
  | { type: 'MP_PIX_COPY'; value?: string }
  | {
      type: 'MP_TOKEN';
      token: string;
      paymentMethodId?: string;
      issuerId?: string;
      installments?: number;
      deviceId?: string | null;
    }
  | { type: 'MP_ERROR'; message?: string }
  | { type: 'MP_CANCEL' };

export default function MercadoPagoSecureFieldsScreen() {
  const params = useLocalSearchParams<{
    amount?: string;
    externalReference?: string;
    summaryTitle?: string;
    summarySubtitle?: string;
  }>();
  const webViewRef = useRef<WebView>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  const amount = useMemo(() => {
    const raw = (params.amount || '').toString();
    const value = Number(raw);
    return Number.isFinite(value) ? value : 0;
  }, [params.amount]);

  const checkoutUrl = useMemo(() => {
    const base = API_BASE_URL.replace(/\/$/, '');
    const qs = new URLSearchParams();
    if (amount > 0) qs.set('amount', String(amount));
    if (params.externalReference) qs.set('externalReference', String(params.externalReference));
    if (params.summaryTitle) qs.set('summaryTitle', String(params.summaryTitle));
    if (params.summarySubtitle) qs.set('summarySubtitle', String(params.summarySubtitle));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return `${base}/payments/mercado-pago/secure-fields${suffix}`;
  }, [amount, params.externalReference, params.summaryTitle, params.summarySubtitle]);

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleMessage = useCallback(
    async (event: any) => {
      try {
        const raw = event?.nativeEvent?.data;
        const parsed = raw ? (JSON.parse(raw) as MpMessage) : null;
        if (!parsed?.type) return;

        if (parsed.type === 'MP_DEVICE_ID') {
          if (parsed.deviceId) setDeviceId(parsed.deviceId);
          return;
        }

        if (parsed.type === 'MP_ERROR') {
          Alert.alert('Pagamento', parsed.message || 'Erro ao carregar o checkout.');
          return;
        }

        if (parsed.type === 'MP_CANCEL') {
          router.back();
          return;
        }

        if (parsed.type === 'MP_PIX_COPY') {
          // Sem dependência de clipboard no app (expo-clipboard). Mantemos o botão no HTML
          // e evitamos quebrar o fluxo.
          return;
        }

        if (parsed.type === 'MP_PIX_CREATE') {
          try {
            const amountValue = Number(String(parsed.amount ?? amount));
            if (!Number.isFinite(amountValue) || amountValue <= 0) {
              throw new Error('Valor inválido para PIX');
            }

            const payload = {
              amount: amountValue,
              externalReference: parsed.externalReference || (params.externalReference ? String(params.externalReference) : ''),
              deviceId: parsed.deviceId || deviceId || undefined,
              description: 'Pagamento GoDrive (PIX)',
            };

            const res = await api.post<{ data: { qr_code_base64: string; qr_code: string } }>(
              '/payments/mercado-pago/pix/create',
              payload,
            );

            const pixData = res?.data;
            const payloadJson = JSON.stringify(pixData);
            const js = `window.__MP_HANDLE_PIX_RESULT(${JSON.stringify(payloadJson)}); true;`;
            webViewRef.current?.injectJavaScript(js);
          } catch (e: any) {
            const payloadJson = JSON.stringify({ message: e?.message || 'Erro ao gerar PIX' });
            const js = `window.__MP_HANDLE_PIX_ERROR(${JSON.stringify(payloadJson)}); true;`;
            webViewRef.current?.injectJavaScript(js);
          }
          return;
        }

        if (parsed.type === 'MP_TOKEN') {
          const token = parsed.token;
          if (!token) {
            Alert.alert('Pagamento', 'Token do cartão não recebido.');
            return;
          }

          router.push({
            pathname: '/(student)/mercado-pago/confirm' as any,
            params: {
              amount: String(amount),
              externalReference: params.externalReference ? String(params.externalReference) : '',
              token,
              paymentMethodId: parsed.paymentMethodId ? String(parsed.paymentMethodId) : '',
              issuerId: parsed.issuerId ? String(parsed.issuerId) : '',
              installments: parsed.installments ? String(parsed.installments) : '',
              deviceId: parsed.deviceId ? String(parsed.deviceId) : deviceId ? String(deviceId) : '',
            },
          });
        }
      } catch (e: any) {
        Alert.alert('Pagamento', 'Mensagem inválida do checkout.');
      }
    },
    [amount, deviceId, params.externalReference],
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between p-4 border-b border-neutral-100">
          <TouchableOpacity onPress={handleBack}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-neutral-900">Pagamento</Text>
          <View className="w-6" />
        </View>

        <View className="flex-1">
          <WebView
            ref={webViewRef}
            source={{ uri: checkoutUrl }}
            onMessage={handleMessage}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={['*']}
            mixedContentMode="always"
          />

          {isLoading ? (
            <View className="absolute inset-0 items-center justify-center bg-white/80">
              <ActivityIndicator size="large" color="#00BFA5" />
              <Text className="text-neutral-600 mt-3">Carregando checkout...</Text>
            </View>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}
