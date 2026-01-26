# Especificação de Endpoints da Carteira (Backend)

## Visão Geral
A tela de carteira do aluno precisa dos seguintes endpoints para funcionar corretamente com dados reais do banco Neon.

## Endpoints Necessários

### 1. GET /api/wallet/balance
**Descrição**: Retorna o saldo completo da carteira do usuário logado

**Response**:
```json
{
  "totalBalance": 10.00,
  "availableBalance": 8.00,
  "lockedBalance": 2.00,
  "usedBalance": 0.00
}
```

**Lógica de Cálculo**:
- **totalBalance**: Soma de todos os créditos do usuário
- **availableBalance**: Soma de transações com status 'AVAILABLE'
- **lockedBalance**: Soma de transações com status 'LOCKED' (aulas agendadas mas não concluídas)
- **usedBalance**: Soma de transações com status 'USED' (aulas já concluídas)

### 2. GET /api/wallet/transactions
**Descrição**: Retorna todas as transações da carteira do usuário

**Response**:
```json
[
  {
    "id": "txn_123",
    "userId": "user_456",
    "amount": 10.00,
    "status": "LOCKED",
    "bookingId": "booking_789",
    "paymentMethod": "MERCADO_PAGO",
    "transactionId": "mp_payment_123",
    "description": "Recarga de créditos - 2 aulas",
    "createdAt": "2025-01-26T14:30:00Z",
    "updatedAt": "2025-01-26T14:30:00Z"
  }
]
```

**Status Possíveis**:
- `AVAILABLE`: Créditos disponíveis para uso
- `LOCKED`: Créditos bloqueados em reservas de aulas
- `USED`: Créditos utilizados em aulas concluídas

## Fluxo de Pagamento e Carteira

### 1. Após Pagamento Aprovado (Mercado Pago)
- Criar transação com status `AVAILABLE`
- Valor adicionado ao `availableBalance`

### 2. Ao Agendar Aula (usar créditos)
- Atualizar transação para status `LOCKED`
- Transferir valor de `availableBalance` para `lockedBalance`
- Associar `bookingId` à transação

### 3. Após Aula Concluída
- Atualizar transação para status `USED`
- Transferir valor de `lockedBalance` para `usedBalance`

### 4. Se Instrutor Recusar Aula
- Atualizar transação para status `AVAILABLE`
- Transferir valor de `lockedBalance` para `availableBalance`
- Remover `bookingId` da transação

## Exemplo Prático

### Cenário: Aluno adiciona R$ 10,00 e agenda 2 aulas de R$ 1,00 cada

1. **Pagamento Aprovado**:
```json
{
  "totalBalance": 10.00,
  "availableBalance": 10.00,
  "lockedBalance": 0.00,
  "usedBalance": 0.00
}
```

2. **Agendar 2 Aulas**:
```json
{
  "totalBalance": 10.00,
  "availableBalance": 8.00,
  "lockedBalance": 2.00,
  "usedBalance": 0.00
}
```

3. **Concluir 1 Aula**:
```json
{
  "totalBalance": 10.00,
  "availableBalance": 8.00,
  "lockedBalance": 1.00,
  "usedBalance": 1.00
}
```

## Integração com Mercado Pago

### Webhook de Pagamento
Quando o Mercado Pago envia webhook de pagamento aprovado:

1. Verificar `payment_id` no webhook
2. Criar `WalletTransaction`:
   - `paymentMethod`: 'MERCADO_PAGO'
   - `transactionId`: `payment_id` do MP
   - `status`: 'AVAILABLE'
   - `description`: "Recarga via Mercado Pago"

### Dados Esperados na UI
- **Saldo Bloqueado**: Deve mostrar R$ 2,00 para o aluno que agendou aulas
- **Histórico**: Deve mostrar a transação do Mercado Pago com ID truncado
- **Status**: Deve indicar claramente o que cada valor representa

## Considerações Técnicas

1. **Timezone**: Usar UTC no banco, converter na UI
2. **Precisão**: Usar decimal(10,2) para valores monetários
3. **Concorrência**: Usar transações para atualizar saldos
4. **Log**: Registrar todas as mudanças de status para auditoria

## Testes Necessários

1. **Criação de transação** após pagamento MP
2. **Bloqueio de créditos** ao agendar aula
3. **Liberação de créditos** ao recusar aula
4. **Utilização de créditos** ao concluir aula
5. **Cálculo correto** dos saldos em todos os cenários
