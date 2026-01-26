# 📋 Backend Spec: Lógica de Saldo na Carteira do Aluno

## Objetivo
Implementar lógica correta de saldo na tela "Minha Carteira" para refletir os pagamentos já realizados via Mercado Pago.

## Requisitos

### 1. Endpoint GET `/wallet/balance`

#### Response esperado:
```typescript
interface WalletBalance {
  totalBalance: number;      // availableBalance + lockedBalance
  availableBalance: number;  // Saldo disponível (estornos/créditos extras)
  lockedBalance: number;     // Soma das aulas PAGAS não realizadas
  usedBalance: number;      // Soma das aulas já realizadas
}
```

#### Lógica de cálculo:
1. **lockedBalance**: Somar todas as aulas com status `'PAID'` (ou `'LOCKED'`) que ainda NÃO foram realizadas
   - Buscar na tabela `lessons` ou `payments`
   - Filtrar: `status = 'PAID'` E `scheduledAt > NOW()`
   - Somar: `SUM(price)` dessas aulas

2. **availableBalance**: Somar transações com status `'AVAILABLE'` na tabela `wallet_transactions`
   - Créditos extras, estornos, etc.
   - Se não houver, deve ser **R$ 0,00**

3. **usedBalance**: Somar aulas já realizadas e pagas
   - Filtrar: `status = 'PAID'` E `scheduledAt <= NOW()`
   - Somar: `SUM(price)` dessas aulas

4. **totalBalance**: `availableBalance + lockedBalance`

### 2. Endpoint GET `/wallet/transactions`

#### Response esperado:
```typescript
interface WalletTransaction {
  id: string;
  userId: string;
  amount: number;
  status: 'AVAILABLE' | 'LOCKED' | 'USED';
  bookingId?: string;           // ID da aula/reserva
  paymentMethod: 'MERCADO_PAGO' | 'STRIPE' | 'OTHER';
  transactionId?: string;      // ID do Mercado Pago
  description?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### Lógica de população:
1. **Transações de Mercado Pago**: Criar automaticamente uma `WalletTransaction` quando:
   - Pagamento for aprovado no Mercado Pago (webhook)
   - Status inicial: `'LOCKED'`
   - `bookingId`: ID da aula/reserva
   - `paymentMethod`: `'MERCADO_PAGO'`
   - `transactionId`: ID da transação do Mercado Pago

2. **Estornos/Créditos**: Criar transações com status `'AVAILABLE'` quando:
   - Instrutor recusa uma aula (libera créditos)
   - Admin adiciona créditos manuais
   - Estorno de pagamento

### 3. Fluxo de Atualização de Status

#### Quando instrutor ACEITA a aula:
```sql
UPDATE wallet_transactions 
SET status = 'USED' 
WHERE bookingId = ? AND status = 'LOCKED';
```

#### Quando instrutor RECUSA a aula:
```sql
UPDATE wallet_transactions 
SET status = 'AVAILABLE' 
WHERE bookingId = ? AND status = 'LOCKED';
```

### 4. Exemplo de Cenário Real

#### Dados no banco:
- Aula 1: R$ 1,00 - status PAID - agendada para amanhã
- Aula 2: R$ 1,00 - status PAID - agendada para depois de amanhã
- Aula 3: R$ 1,00 - status PAID - já realizada (ontem)
- Crédito extra: R$ 5,00 - status AVAILABLE

#### Response esperado:
```json
{
  "totalBalance": 7.00,    // 2.00 (locked) + 5.00 (available)
  "availableBalance": 5.00, // Apenas créditos extras
  "lockedBalance": 2.00,    // Aulas 1 + 2 (não realizadas)
  "usedBalance": 1.00       // Aula 3 (já realizada)
}
```

#### Transações retornadas:
```json
[
  {
    "id": "tx_1",
    "amount": 1.00,
    "status": "LOCKED",
    "bookingId": "aula_1",
    "paymentMethod": "MERCADO_PAGO",
    "transactionId": "mp_12345",
    "description": "Pagamento da aula",
    "createdAt": "2026-01-26T10:00:00Z"
  },
  {
    "id": "tx_2",
    "amount": 1.00,
    "status": "LOCKED",
    "bookingId": "aula_2",
    "paymentMethod": "MERCADO_PAGO",
    "transactionId": "mp_12346",
    "description": "Pagamento da aula",
    "createdAt": "2026-01-26T11:00:00Z"
  },
  {
    "id": "tx_3",
    "amount": 1.00,
    "status": "USED",
    "bookingId": "aula_3",
    "paymentMethod": "MERCADO_PAGO",
    "transactionId": "mp_12347",
    "description": "Pagamento da aula",
    "createdAt": "2026-01-25T10:00:00Z"
  },
  {
    "id": "tx_4",
    "amount": 5.00,
    "status": "AVAILABLE",
    "paymentMethod": "OTHER",
    "description": "Créditos adicionados pelo admin",
    "createdAt": "2026-01-20T15:00:00Z"
  }
]
```

## SQL Queries Sugeridas

### Para calcular lockedBalance:
```sql
SELECT COALESCE(SUM(price), 0) as lockedBalance
FROM lessons l
JOIN payments p ON l.id = p.lessonId
WHERE l.studentId = ? 
  AND p.status = 'PAID'
  AND l.scheduledAt > NOW()
  AND l.status != 'CANCELLED';
```

### Para calcular usedBalance:
```sql
SELECT COALESCE(SUM(price), 0) as usedBalance
FROM lessons l
JOIN payments p ON l.id = p.lessonId
WHERE l.studentId = ? 
  AND p.status = 'PAID'
  AND l.scheduledAt <= NOW()
  AND l.status IN ('COMPLETED', 'EVALUATED');
```

### Para calcular availableBalance:
```sql
SELECT COALESCE(SUM(amount), 0) as availableBalance
FROM wallet_transactions
WHERE userId = ? 
  AND status = 'AVAILABLE';
```

## Implementação Obrigatória

1. **Criar tabela `wallet_transactions`** se não existir
2. **Criar trigger** para gerar `WalletTransaction` quando pagamento for aprovado
3. **Implementar endpoints** `/wallet/balance` e `/wallet/transactions`
4. **Atualizar status** das transações quando instrutor aceita/recusa
5. **Testar com cenário real** de R$ 2,00 bloqueados

---

**Importante**: O frontend já está preparado para exibir corretamente os dados. O backend precisa implementar essa lógica para que a tela reflita a realidade.
