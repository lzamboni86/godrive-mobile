import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { API_BASE_URL } from '@/services/api';
import api from '@/services/api';
import { mercadoPagoService } from '@/services/mercado-pago';

type MpMessage =
  | { type: 'MP_READY' }
  | { type: 'MP_DEVICE_ID'; deviceId?: string }
  | { type: 'MP_PIX_CREATE'; amount?: string; externalReference?: string; deviceId?: string | null }
  | { type: 'MP_PIX_CREATED'; paymentId?: string | null }
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
  const [pixPaymentId, setPixPaymentId] = useState<string | null>(null);
  const [isCheckingPix, setIsCheckingPix] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

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

  const applyWebViewBottomPadding = useCallback((_enabled: boolean) => {
    const padding = 0;
    const js = `
      (function () {
        try {
          var pb = '${padding}px';
          if (document && document.documentElement) document.documentElement.style.paddingBottom = pb;
          if (document && document.body) document.body.style.paddingBottom = pb;
        } catch (e) {}
      })();
      true;
    `;
    webViewRef.current?.injectJavaScript(js);
  }, []);

  const extractPaymentStatus = useCallback((payment: any) => {
    const status = payment?.status ?? payment?.data?.status;
    return String(status || '').toLowerCase();
  }, []);

  const sendPixByEmail = useCallback(async () => {
    if (!pixPaymentId) return;
    setIsSendingEmail(true);
    try {
      await api.post('/payments/mercado-pago/pix/send-email', { paymentId: pixPaymentId });
      Alert.alert('PIX enviado', 'O QR code foi enviado para seu e-mail.');
    } catch (e: any) {
      Alert.alert('Erro ao enviar', e?.message || 'Não foi possível enviar o QR code por e-mail.');
    } finally {
      setIsSendingEmail(false);
    }
  }, [pixPaymentId]);

  const checkPixPaymentStatus = useCallback(async () => {
    if (!pixPaymentId) return;
    setIsCheckingPix(true);
    try {
      const payment = await mercadoPagoService.getPaymentStatus(pixPaymentId);
      const status = extractPaymentStatus(payment);

      if (status === 'approved') {
        router.replace({
          pathname: '/(student)/schedule/success' as any,
          params: { collection_status: 'approved' },
        });
        return;
      }

      if (status === 'pending' || status === 'in_process') {
        Alert.alert('Pagamento', 'Ainda estamos aguardando a confirmação do PIX. Tente novamente em instantes.');
        return;
      }

      router.replace('/(student)/schedule/failure' as any);
    } catch (e: any) {
      Alert.alert('Pagamento', e?.message || 'Não foi possível verificar o pagamento.');
    } finally {
      setIsCheckingPix(false);
    }
  }, [extractPaymentStatus, pixPaymentId]);

  useEffect(() => {
    if (!pixPaymentId) return;

    let cancelled = false;
    let tries = 0;
    const maxTries = 24;
    const timer = setInterval(async () => {
      if (cancelled) return;
      tries += 1;
      try {
        const payment = await mercadoPagoService.getPaymentStatus(pixPaymentId);
        const status = extractPaymentStatus(payment);

        if (status === 'approved') {
          clearInterval(timer);
          router.replace({
            pathname: '/(student)/schedule/success' as any,
            params: { collection_status: 'approved' },
          });
          return;
        }

        if (status && status !== 'pending' && status !== 'in_process') {
          clearInterval(timer);
          router.replace('/(student)/schedule/failure' as any);
          return;
        }
      } catch {
        // Ignora erro momentâneo e tenta novamente
      }

      if (tries >= maxTries) {
        clearInterval(timer);
        router.replace('/(student)/schedule/pending' as any);
      }
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [extractPaymentStatus, pixPaymentId]);

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

            const pixData: any = (res as any)?.data ?? res;
            const possiblePaymentId =
              pixData?.id ||
              pixData?.paymentId ||
              pixData?.data?.id ||
              (res as any)?.id ||
              (res as any)?.paymentId ||
              null;

            if (possiblePaymentId) {
              setPixPaymentId(String(possiblePaymentId));
              applyWebViewBottomPadding(true);
            }
            const payloadJson = JSON.stringify(pixData);

            const js = `
              window.__MP_HANDLE_PIX_RESULT(${JSON.stringify(payloadJson)});
              try {
                if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MP_PIX_CREATED', paymentId: ${JSON.stringify(possiblePaymentId)} }));
                }
              } catch (e) {}
              true;
            `;
            webViewRef.current?.injectJavaScript(js);
          } catch (e: any) {
            const payloadJson = JSON.stringify({ message: e?.message || 'Erro ao gerar PIX' });
            const js = `window.__MP_HANDLE_PIX_ERROR(${JSON.stringify(payloadJson)}); true;`;
            webViewRef.current?.injectJavaScript(js);
          }
          return;
        }

        if (parsed.type === 'MP_PIX_CREATED') {
          const id = parsed.paymentId ? String(parsed.paymentId) : '';
          if (id) {
            setPixPaymentId(id);
            applyWebViewBottomPadding(true);
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

  useEffect(() => {
    applyWebViewBottomPadding(Boolean(pixPaymentId));
  }, [applyWebViewBottomPadding, pixPaymentId]);

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
            onLoadEnd={() => {
              setIsLoading(false);
              applyWebViewBottomPadding(Boolean(pixPaymentId));
            }}
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

        {pixPaymentId ? (
          <View className="bg-white border-t border-neutral-200 px-4 py-3">
            <Text className="text-neutral-900 font-semibold">Já pagou o PIX?</Text>
            <Text className="text-neutral-600 text-xs mt-1">
              Após concluir o pagamento no seu banco, toque em "Verificar pagamento".
            </Text>
            <TouchableOpacity
              className="bg-[#00BFA5] rounded-xl h-10 mt-2 disabled:opacity-60"
              onPress={checkPixPaymentStatus}
              disabled={isCheckingPix}
            >
              <View className="flex-row items-center justify-center h-full">
                {isCheckingPix ? <ActivityIndicator size="small" color="#FFFFFF" /> : null}
                <Text className="text-white font-semibold text-sm ml-2">
                  {isCheckingPix ? 'Verificando...' : 'Verificar pagamento'}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-neutral-100 rounded-xl h-10 mt-1 disabled:opacity-60"
              onPress={sendPixByEmail}
              disabled={isSendingEmail}
            >
              <View className="flex-row items-center justify-center h-full">
                {isSendingEmail ? <ActivityIndicator size="small" color="#374151" /> : null}
                <Text className="text-neutral-700 font-semibold text-sm ml-2">
                  {isSendingEmail ? 'Enviando...' : 'Enviar QR code por e-mail'}
                </Text>
              </View>
            </TouchableOpacity>
            <Text className="text-neutral-500 text-xs mt-1">
              O sistema verifica automaticamente por alguns instantes.
            </Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
