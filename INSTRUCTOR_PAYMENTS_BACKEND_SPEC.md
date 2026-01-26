# Especificação de Endpoints de Pagamentos do Instrutor (Backend)

## Visão Geral
A tela de pagamentos do instrutor precisa dos seguintes endpoints para funcionar corretamente com dados reais do banco Neon, implementando a taxa de gerenciamento de 12% da plataforma.

## Constantes de Negócio

### Taxa de Gerenciamento
- **PLATFORM_FEE_PERCENTAGE**: 12% (0.12)
- **NET_AMOUNT_MULTIPLIER**: 88% (0.88)

### Status dos Pagamentos
- **HELD**: Aula aprovada, aguardando realização
- **RELEASED**: Aula concluída, aguardando transferência
- **PAID**: Valor transferido para conta do instrutor

## Endpoints Necessários

### 1. GET /api/instructor/{instructorId}/payments
**Descrição**: Retorna todos os pagamentos do instrutor com valores já calculados

**Response**:
```json
[
  {
    "id": "payment_123",
    "lessonId": "lesson_456",
    "lesson": {
      "lessonDate": "2025-01-27",
      "lessonTime": "14:00",
      "student": {
        "user": { 
          "name": "João Aluno", 
          "email": "aluno@gmail.com" 
        }
      }
    },
    "originalAmount": 100.00,
    "amount": 88.00,
    "status": "RELEASED",
    "releasedAt": "2025-01-27T16:00:00Z",
    "paidAt": null,
    "createdAt": "2025-01-26T14:30:00Z"
  }
]
```

**Lógica de Cálculo**:
- `originalAmount`: Valor bruto da aula (ex: R$ 100,00)
- `amount`: Valor líquido após taxa (ex: R$ 88,00)
- `amount = originalAmount * (1 - 0.12)`

### 2. GET /api/instructor/{instructorId}/payments/summary
**Descrição**: Retorna resumo financeiro do instrutor

**Response**:
```json
{
  "totalReleased": 176.00,
  "totalHeld": 88.00,
  "totalPaid": 352.00,
  "platformFee": 96.00
}
```

**Lógica de Cálculo**:
- **totalReleased**: Soma de `amount` dos pagamentos com status 'RELEASED'
- **totalHeld**: Soma de `amount` dos pagamentos com status 'HELD'
- **totalPaid**: Soma de `amount` dos pagamentos com status 'PAID'
- **platformFee**: Soma das taxas (12% de todos os valores brutos)

## Fluxo de Pagamentos

### 1. Aula Agendada (Status: HELD)
```sql
-- Criar payment quando aula é agendada
INSERT INTO payments (
  lesson_id, 
  original_amount, 
  amount, 
  status
) VALUES (
  'lesson_123',
  100.00,
  88.00,  -- 100 * 0.88
  'HELD'
);
```

### 2. Aula Concluída (Status: RELEASED)
```sql
-- Atualizar quando aula é concluída
UPDATE payments 
SET status = 'RELEASED', 
    released_at = NOW() 
WHERE lesson_id = 'lesson_123';
```

### 3. Pagamento Efetuado (Status: PAID)
```sql
-- Atualizar quando transferência é realizada
UPDATE payments 
SET status = 'PAID', 
    paid_at = NOW() 
WHERE lesson_id = 'lesson_123';
```

## Exemplo Prático

### Cenário: Instrutor com 3 aulas de R$ 100,00 cada

1. **Aulas Agendadas**:
```json
{
  "totalReleased": 0.00,
  "totalHeld": 264.00,    // 3 x R$ 88,00
  "totalPaid": 0.00,
  "platformFee": 36.00    // 3 x R$ 12,00
}
```

2. **1 Aula Concluída**:
```json
{
  "totalReleased": 88.00,  // 1 x R$ 88,00
  "totalHeld": 176.00,     // 2 x R$ 88,00
  "totalPaid": 0.00,
  "platformFee": 36.00
}
```

3. **1 Aula Paga**:
```json
{
  "totalReleased": 88.00,
  "totalHeld": 176.00,
  "totalPaid": 88.00,      // 1 x R$ 88,00
  "platformFee": 36.00
}
```

## Schema da Tabela

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id),
  original_amount DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,        -- Valor líquido
  status VARCHAR(20) NOT NULL DEFAULT 'HELD',
  released_at TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Queries SQL

### Buscar Pagamentos do Instrutor
```sql
SELECT 
  p.id,
  p.lesson_id,
  p.original_amount,
  p.amount,
  p.status,
  p.released_at,
  p.paid_at,
  p.created_at,
  l.lesson_date,
  l.lesson_time,
  s.user_id,
  s_user.name as student_name,
  s_user.email as student_email
FROM payments p
JOIN lessons l ON p.lesson_id = l.id
JOIN students s ON l.student_id = s.id
JOIN users s_user ON s.user_id = s_user.id
JOIN instructors i ON l.instructor_id = i.id
WHERE i.user_id = $1
ORDER BY p.created_at DESC;
```

### Calcular Resumo Financeiro
```sql
SELECT 
  COALESCE(SUM(CASE WHEN status = 'RELEASED' THEN amount END), 0) as total_released,
  COALESCE(SUM(CASE WHEN status = 'HELD' THEN amount END), 0) as total_held,
  COALESCE(SUM(CASE WHEN status = 'PAID' THEN amount END), 0) as total_paid,
  COALESCE(SUM(original_amount * 0.12), 0) as platform_fee
FROM payments p
JOIN lessons l ON p.lesson_id = l.id
JOIN instructors i ON l.instructor_id = i.id
WHERE i.user_id = $1;
```

## Funções de Cálculo (Backend)

```typescript
// utils/payment.ts
export const PLATFORM_FEE_PERCENTAGE = 0.12;

export const calculateNetAmount = (grossAmount: number): number => {
  return grossAmount * (1 - PLATFORM_FEE_PERCENTAGE);
};

export const calculatePlatformFee = (grossAmount: number): number => {
  return grossAmount * PLATFORM_FEE_PERCENTAGE;
};

export const createPaymentFromLesson = (lesson: Lesson): Payment => {
  const netAmount = calculateNetAmount(lesson.price);
  
  return {
    lessonId: lesson.id,
    originalAmount: lesson.price,
    amount: netAmount,
    status: 'HELD'
  };
};
```

## Validações Necessárias

1. **Precisão Monetária**: Usar DECIMAL(10,2) para valores
2. **Concorrência**: Usar transações para atualizações de status
3. **Integridade**: Verificar se lesson existe ao criar payment
4. **Consistência**: Garantir que amount = original_amount * 0.88

## Testes Necessários

1. **Cálculo da Taxa**: Verificar 12% em diferentes valores
2. **Fluxo Completo**: HELD → RELEASED → PAID
3. **Resumo Financeiro**: Validar somas em todos os cenários
4. **Filtros**: Apenas pagamentos do instrutor correto
5. **Timezone**: Datas em UTC, conversão na UI

## Integração com Webhooks

Quando aula for concluída via webhook/calendar:
1. Atualizar status da lesson para 'COMPLETED'
2. Atualizar payment para 'RELEASED'
3. Disparar notificação ao instrutor

Quando transferência for confirmada:
1. Atualizar payment para 'PAID'
2. Registrar data de pagamento
3. Enviar comprovante ao instrutor
