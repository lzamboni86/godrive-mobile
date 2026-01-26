import api from './api';
import { WalletTransaction, WalletBalance, WalletTransactionStatus } from '@/types';

export interface CreateWalletTransactionRequest {
  amount: number;
  description?: string;
  bookingId?: string;
  paymentMethod: 'MERCADO_PAGO' | 'STRIPE' | 'OTHER';
  transactionId?: string;
}

export interface UseCreditsRequest {
  amount: number;
  description: string;
  bookingId?: string;
}

export const walletService = {
  /**
   * Obtém o saldo completo da carteira do usuário
   */
  async getBalance(): Promise<WalletBalance> {
    console.log('💰 [WALLET] Obtendo saldo da carteira...');
    
    try {
      const balance = await api.get<WalletBalance>('/wallet/balance');
      console.log('💰 [WALLET] ✅ Saldo obtido:', balance);
      return balance;
    } catch (error: any) {
      console.error('💰 [WALLET] ❌ Erro ao obter saldo:', error);
      throw error;
    }
  },

  /**
   * Obtém todas as transações da carteira
   */
  async getTransactions(): Promise<WalletTransaction[]> {
    console.log('💰 [WALLET] Obtendo transações...');
    
    try {
      const transactions = await api.get<WalletTransaction[]>('/wallet/transactions');
      console.log('💰 [WALLET] ✅ Transações obtidas:', transactions);
      return transactions;
    } catch (error: any) {
      console.error('💰 [WALLET] ❌ Erro ao obter transações:', error);
      throw error;
    }
  },

  /**
   * Cria uma nova transação na carteira (após pagamento aprovado)
   */
  async createTransaction(request: CreateWalletTransactionRequest): Promise<WalletTransaction> {
    console.log('💰 [WALLET] Criando transação...');
    console.log('💰 [WALLET] Request:', JSON.stringify(request, null, 2));
    
    try {
      const transaction = await api.post<WalletTransaction>('/wallet/transactions', request);
      console.log('💰 [WALLET] ✅ Transação criada:', transaction);
      return transaction;
    } catch (error: any) {
      console.error('💰 [WALLET] ❌ Erro ao criar transação:', error);
      throw error;
    }
  },

  /**
   * Atualiza o status de uma transação (usado quando instrutor aceita/recusa)
   */
  async updateTransactionStatus(
    transactionId: string, 
    status: WalletTransactionStatus
  ): Promise<WalletTransaction> {
    console.log('💰 [WALLET] Atualizando status da transação:', transactionId, '->', status);
    
    try {
      const transaction = await api.patch<WalletTransaction>(`/wallet/transactions/${transactionId}/status`, { status });
      console.log('💰 [WALLET] ✅ Status atualizado:', transaction);
      return transaction;
    } catch (error: any) {
      console.error('💰 [WALLET] ❌ Erro ao atualizar status:', error);
      throw error;
    }
  },

  /**
   * Usa créditos disponíveis para uma nova reserva
   */
  async useCredits(request: UseCreditsRequest): Promise<WalletTransaction> {
    console.log('💰 [WALLET] Usando créditos...');
    console.log('💰 [WALLET] Request:', JSON.stringify(request, null, 2));
    
    try {
      const transaction = await api.post<WalletTransaction>('/wallet/use-credits', request);
      console.log('💰 [WALLET] ✅ Créditos utilizados:', transaction);
      return transaction;
    } catch (error: any) {
      console.error('💰 [WALLET] ❌ Erro ao usar créditos:', error);
      throw error;
    }
  },

  /**
   * Verifica se o usuário tem saldo disponível suficiente
   */
  async checkAvailableBalance(requiredAmount: number): Promise<{ hasBalance: boolean; availableBalance: number }> {
    console.log('💰 [WALLET] Verificando saldo disponível para:', requiredAmount);
    
    try {
      const result = await api.get<{ hasBalance: boolean; availableBalance: number }>(`/wallet/check-balance?amount=${requiredAmount}`);
      console.log('💰 [WALLET] ✅ Verificação concluída:', result);
      return result;
    } catch (error: any) {
      console.error('💰 [WALLET] ❌ Erro ao verificar saldo:', error);
      throw error;
    }
  },

  /**
   * Libera saldo bloqueado quando instrutor recusa
   */
  async releaseLockedBalance(transactionId: string): Promise<WalletTransaction> {
    console.log('💰 [WALLET] Liberando saldo bloqueado:', transactionId);
    
    try {
      const transaction = await api.post<WalletTransaction>(`/wallet/transactions/${transactionId}/release`);
      console.log('💰 [WALLET] ✅ Saldo liberado:', transaction);
      return transaction;
    } catch (error: any) {
      console.error('💰 [WALLET] ❌ Erro ao liberar saldo:', error);
      throw error;
    }
  },

  /**
   * Marca transação como usada quando instrutor aceita
   */
  async markAsUsed(transactionId: string): Promise<WalletTransaction> {
    console.log('💰 [WALLET] Marcando transação como usada:', transactionId);
    
    try {
      const transaction = await api.post<WalletTransaction>(`/wallet/transactions/${transactionId}/mark-used`);
      console.log('💰 [WALLET] ✅ Transação marcada como usada:', transaction);
      return transaction;
    } catch (error: any) {
      console.error('💰 [WALLET] ❌ Erro ao marcar como usada:', error);
      throw error;
    }
  },
};
