import api from './api';
import { MercadoPagoPreference } from '@/types';

export interface CreatePaymentRequest {
  amount: number;
  description: string;
  externalReference?: string;
  payerEmail: string;
  payerName?: string;
  items: Array<{
    id: string;
    title: string;
    description: string;
    quantity: number;
    unitPrice: number;
    currencyId: string;
  }>;
}

export interface WebhookNotification {
  type: string;
  action: string;
  data: {
    id: string;
  };
}

export const mercadoPagoService = {
  /**
   * Cria uma preferência de pagamento no Mercado Pago
   */
  async createPreference(request: CreatePaymentRequest): Promise<MercadoPagoPreference> {
    console.log('💳 [MP] Criando preferência de pagamento...');
    console.log('💳 [MP] Request:', JSON.stringify(request, null, 2));
    
    try {
      const preference = await api.post<MercadoPagoPreference>('/payments/mercado-pago/create-preference', request);
      console.log('💳 [MP] ✅ Preferência criada:', preference);
      return preference;
    } catch (error: any) {
      console.error('💳 [MP] ❌ Erro ao criar preferência:', error);
      console.error('💳 [MP] ❌ response.data:', error?.response?.data);
      console.error('💳 [MP] ❌ status:', error?.response?.status);
      console.error('💳 [MP] ❌ headers:', error?.response?.headers);
      throw error;
    }
  },

  /**
   * Obtém o status de um pagamento
   */
  async getPaymentStatus(paymentId: string): Promise<any> {
    console.log('💳 [MP] Verificando status do pagamento:', paymentId);
    
    try {
      const status = await api.get<any>(`/payments/mercado-pago/status/${paymentId}`);
      console.log('💳 [MP] ✅ Status obtido:', status);
      return status;
    } catch (error: any) {
      console.error('💳 [MP] ❌ Erro ao obter status:', error);
      throw error;
    }
  },

  /**
   * Processa webhook do Mercado Pago
   */
  async processWebhook(notification: WebhookNotification): Promise<void> {
    console.log('💳 [MP] Processando webhook:', notification);
    
    try {
      await api.post('/payments/mercado-pago/webhook', notification);
      console.log('💳 [MP] ✅ Webhook processado com sucesso');
    } catch (error: any) {
      console.error('💳 [MP] ❌ Erro ao processar webhook:', error);
      throw error;
    }
  },

  /**
   * Cancela um pagamento
   */
  async cancelPayment(paymentId: string): Promise<void> {
    console.log('💳 [MP] Cancelando pagamento:', paymentId);
    
    try {
      await api.post(`/payments/mercado-pago/cancel/${paymentId}`);
      console.log('💳 [MP] ✅ Pagamento cancelado');
    } catch (error: any) {
      console.error('💳 [MP] ❌ Erro ao cancelar pagamento:', error);
      throw error;
    }
  },

  /**
   * Refunda um pagamento
   */
  async refundPayment(paymentId: string): Promise<void> {
    console.log('💳 [MP] Reembolsando pagamento:', paymentId);
    
    try {
      await api.post(`/payments/mercado-pago/refund/${paymentId}`);
      console.log('💳 [MP] ✅ Pagamento reembolsado');
    } catch (error: any) {
      console.error('💳 [MP] ❌ Erro ao reembolsar pagamento:', error);
      throw error;
    }
  },
};
