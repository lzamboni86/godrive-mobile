# Diagrama de Fluxo de Dados - Go Drive Platform

## Arquitetura Financeira e Integração

```mermaid
graph TD
    %% Estilo Global
    classDef student fill:#10B981,fill-opacity:0.1,stroke:#10B981,stroke-width:2px,color:#064E3B
    classDef instructor fill:#059669,fill-opacity:0.1,stroke:#059669,stroke-width:2px,color:#064E3B
    classDef admin fill:#047857,fill-opacity:0.1,stroke:#047857,stroke-width:2px,color:#064E3B
    classDef app fill:#F3F4F6,stroke:#6B7280,stroke-width:2px,color:#111827
    classDef backend fill:#FEF3C7,stroke:#F59E0B,stroke-width:2px,color:#78350F
    classDef payment fill:#DBEAFE,stroke:#3B82F6,stroke-width:2px,color:#1E3A8A
    classDef database fill:#EDE9FE,stroke:#8B5CF6,stroke-width:2px,color:#4C1D95
    classDef security fill:#FEE2E2,stroke:#EF4444,stroke-width:2px,color:#7F1D1D
    classDef process fill:#D1FAE5,stroke:#10B981,stroke-width:2px,color:#064E3B

    %% Atores
    S[👨‍🎓 Estudante\naluno@gmail.com]:::student
    I[👨‍🏫 Instrutor\ninstrutor@gmail.com]:::instructor
    A[👤 Administrador]:::admin

    %% Aplicação
    APP[📱 Go Drive App\nReact Native/Expo]:::app

    %% Backend e Infraestrutura
    BACKEND[🖥️ Backend\nRender/NestJS]:::backend
    DB[🗄️ Banco de Dados\nNeon/PostgreSQL]:::database

    %% Sistema de Pagamento
    MP[💳 Mercado Pago\nGateway PCI]:::payment

    %% Componentes de Segurança
    CPF[🔍 Validação CPF\nLGPD Compliance]:::security
    TOKEN[🔐 Tokenização\nSecure Fields]:::security

    %% Processos Financeiros
    TAX[💰 Taxa Delta Pro\n12% Platform Fee]:::process
    ESCROW[🔒 Sistema Escrow\nBloqueio de Saldo]:::process
    RELEASE[💸 Liberação\nPagamento Instrutor]:::process

    %% Status da Aula
    PENDING[⏳ PENDING_PAYMENT]:::process
    CONFIRMED[✅ CONFIRMED]:::process
    INPROGRESS[🚗 IN_PROGRESS]:::process
    COMPLETED[🎯 COMPLETED]:::process

    %% Fluxo Principal de Pagamento
    S -->|1. Busca Instrutor|APP
    S -->|2. Dados Cartão|TOKEN
    TOKEN -->|3. Tokenização Segura|APP
    APP -->|4. Cria Preferência|MP
    MP -->|5. Processamento|MP
    MP -->|6. Webhook Confirmação|BACKEND

    %% Fluxo de Validação e Segurança
    APP -->|Validação CPF|CPF
    CPF -->|LGPD Check|BACKEND
    BACKEND -->|Dados Seguros|DB

    %% Lógica Financeira Principal
    BACKEND -->|Grava Transação|DB
    BACKEND -->|Calcula Taxa|TAX
    TAX -->|12% Platform Fee|BACKEND
    BACKEND -->|Divide Saldo|ESCROW

    %% Fluxo da Carteira (Aluno)
    ESCROW -->|Crédito Bloqueado|DB
    DB -->|Saldo: Bloqueado|S

    %% Fluxo de Pagamento (Instrutor)
    ESCROW -->|Saldo Retido|DB
    DB -->|Saldo: Disponível|I

    %% Ciclo de Vida da Aula
    APP -->|Agendamento|PENDING
    PENDING -->|Pagamento Confirmado|CONFIRMED
    CONFIRMED -->|Início da Aula|INPROGRESS
    INPROGRESS -->|Aula Concluída|COMPLETED

    %% Liberação Financeira
    COMPLETED -->|Trigger Liberação|RELEASE
    RELEASE -->|Desbloqueia Saldo|DB
    DB -->|Saldo Liberado|I
    DB -->|Saldo Utilizado|S

    %% Gestão Administrativa
    A -->|Monitoramento|BACKEND
    A -->|Relatórios Financeiros|DB
    BACKEND -->|Dashboard Admin|A

    %% Fluxo de Comunicação
    I -->|Aceita/Rejeita|APP
    APP -->|Atualização Status|BACKEND
    BACKEND -->|Notificação Push|S
    BACKEND -->|Notificação Push|I

    %% Integrações Externas
    MP -.->|API REST|BACKEND
    BACKEND -.->|Webhooks|MP
    BACKEND -.->|Queries SQL|DB

    %% Legenda e Destaques
    subgraph "🏦 Fluxo Financeiro Principal"
        TAX
        ESCROW
        RELEASE
    end

    subgraph "🔒 Componentes de Segurança"
        CPF
        TOKEN
    end

    subgraph "📊 Ciclo de Vida da Aula"
        PENDING
        CONFIRMED
        INPROGRESS
        COMPLETED
    end

    %% Anotações Importantes
    note1[💡 PCI Compliance: Dados de cartão\nnunca tocam o backend]:::security
    note2[🛡️ LGPD: Dados pessoais\ncriptografados no secure storage]:::security
    note3[⚡ Real-time: Socket.io para\natualizações instantâneas]:::process

    TOKEN --> note1
    CPF --> note2
    BACKEND --> note3
```

## 📋 Descrição dos Componentes

### 🎭 Atores do Sistema
- **Estudante**: Usuário final que busca aulas e realiza pagamentos
- **Instrutor**: Profissional que oferece aulas de direção
- **Administrador**: Gestor da plataforma (Delta Pro Tecnologia)

### 💳 Fluxo de Pagamento
1. **Tokenização Segura**: Dados do cartão são processados via Secure Fields
2. **Gateway PCI**: Mercado Pago garante conformidade PCI DSS
3. **Webhook**: Confirmação assíncrona do pagamento
4. **Escrow**: Sistema de bloqueio de valores até conclusão do serviço

### 🏦 Lógica Financeira
- **Taxa de Plataforma**: 12% sobre cada transação (receita Delta Pro)
- **Divisão de Saldo**: Bloqueado (aluno) → Retido (instrutor)
- **Liberação**: Após conclusão da aula com status COMPLETED

### 🔒 Segurança e Compliance
- **Validação CPF**: Verificação em tempo real contra receita federal
- **LGPD**: Armazenamento seguro de dados pessoais
- **PCI DSS**: Conformidade com padrões de segurança de cartões

### 📊 Status da Aula
- **PENDING_PAYMENT**: Aguardando confirmação
- **CONFIRMED**: Pagamento aprovado, aula agendada
- **IN_PROGRESS**: Aula em andamento
- **COMPLETED**: Aula concluída, saldo liberado

---

## 🎯 KPIs e Métricas de Negócio

| Métrica | Descrição | Impacto |
|---------|-----------|---------|
| **Taxa de Conversão** | % de agendamentos concluídos | Receita Delta Pro |
| **Ticket Médio** | Valor médio por aula | Otimização de preços |
| **Tempo de Liberação** | Prazo pagamento → instrutor | Satisfação profissional |
| **Churn Rate** | % de instrutores inativos | Retenção de talentos |

---

*Diagrama criado para apresentação à Delta Pro - Janeiro 2026*
