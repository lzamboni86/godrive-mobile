# 🔍 Debug do Erro 403 (Forbidden) do Mercado Pago

## Objetivo
Identificar e corrigir a causa do erro 403 ao criar preferências de pagamento no Mercado Pago em produção.

## Ações Necessárias no Backend

### 1. Log Detalhado do Payload Enviado
No arquivo que cria a preferência (ex.: `mercado-pago.service.ts` no backend), **antes de chamar a API do Mercado Pago**, adicione:

```typescript
console.log('🔍 [MP-BACKEND] Payload enviado para Mercado Pago:', JSON.stringify(preferenceBody, null, 2));
```

Verifique especialmente:
- `payer.email`
- `payer.identification.type` e `payer.identification.number`

### 2. Remoção de Dados Fake
Se `payer.identification.number` estiver como `"00000000000"` ou similar, **remova o campo `identification`** ou use um CPF/CNPJ válido para teste. Em produção, o Mercado Pago exige dados reais.

Exemplo de remoção segura:
```typescript
if (preferenceBody.payer?.identification?.number === '00000000000') {
  delete preferenceBody.payer.identification;
}
```

### 3. Confirmação do Token
Garanta que o token usado seja `process.env.MERCADO_PAGO_ACCESS_TOKEN` e não um valor hardcoded.

Exemplo:
```typescript
const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
if (!accessToken) {
  throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
}
```

### 4. Tratamento de Erro Completo
No `catch` da chamada ao Mercado Pago, logue o erro completo:

```typescript
catch (error: any) {
  console.error('❌ [MP-BACKEND] Erro ao criar preferência:', error);
  console.error('❌ [MP-BACKEND] response.data:', error?.response?.data);
  console.error('❌ [MP-BACKEND] response.status:', error?.response?.status);
  console.error('❌ [MP-BACKEND] response.headers:', error?.response?.headers);
  throw error;
}
```

## Exemplo de Payload Esperado

```json
{
  "items": [
    {
      "id": "aula-1",
      "title": "Aula de Carro",
      "description": "Aula de 50 minutos",
      "quantity": 1,
      "unit_price": 15000,
      "currency_id": "BRL"
    }
  ],
  "payer": {
    "email": "aluno@exemplo.com"
    // identification: omitido ou com CPF válido
  },
  "back_urls": {
    "success": "https://godrive-7j7x.onrender.com/schedule/success",
    "failure": "https://godrive-7j7x.onrender.com/schedule/failure",
    "pending": "https://godrive-7j7x.onrender.com/schedule/pending"
  },
  "auto_return": "approved",
  "external_reference": "schedule-123"
}
```

## Mensagens Comuns no response.data (403)
- `"Account not verified"` → Conta do Mercado Pago não verificada.
- `"Invalid client_id"` → Token inválido ou de sandbox em produção.
- `"Invalid identification"` → CPF/CNPJ inválido ou faltando.
- `"Invalid payer email"` → E-mail inválido ou não pertence à conta.

## Como Testar
1. Adicione os logs no backend.
2. Tente criar uma preferência pelo app.
3. Verifique os logs no servidor para:
   - O payload exato enviado.
   - A mensagem de erro completa no `response.data`.
4. Ajuste conforme a mensagem específica.

## Próximos Passos
- Se o erro for `"Account not verified"` → Verificar status da conta no Mercado Pago.
- Se o erro for `"Invalid client_id"` → Confirmar que o token é de produção.
- Se o erro for `"Invalid identification"` → Remover ou corrigir o CPF/CNPJ.

---

**Importante:** Não envie dados de identificação falsos em produção. Remova o campo se não tiver um CPF/CNPJ real.
