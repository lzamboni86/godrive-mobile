# GoDrive Mobile - Instrutor

Aplicativo mobile para instrutores de direção da plataforma GoDrive.

## 🚀 Tecnologias

- **Expo** ~52.0.0 - Framework React Native
- **Expo Router** ~4.0.0 - Navegação file-based
- **TypeScript** ~5.3.3 - Tipagem estática
- **NativeWind** ^4.0.1 - TailwindCSS para React Native
- **Lucide React Native** - Ícones modernos
- **Axios** - Cliente HTTP

## 📱 Funcionalidades

### Dashboard do Instrutor
- Card de **Saldo Liberado** (pagamentos com status `RELEASED`)
- Lista de **Aulas do Dia** (status `CONFIRMED`)
- Botão **Finalizar Aula** que:
  - Atualiza a aula para `COMPLETED`
  - Dispara a "Regra de Ouro": `PATCH /payments/release`

### Tabs
- **Início** - Dashboard principal
- **Agenda** - Visualização de agenda (em breve)
- **Perfil** - Dados do instrutor (em breve)
- **Ajustes** - Configurações (em breve)

## 🛠️ Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start

# Executar no Android
npm run android

# Executar no iOS
npm run ios
```

## ⚙️ Configuração do Backend

Edite o arquivo `services/api.ts` para configurar o IP do seu backend:

```typescript
// Para emulador Android
const API_BASE_URL = 'http://10.0.2.2:3000';

// Para simulador iOS
const API_BASE_URL = 'http://localhost:3000';

// Para dispositivo físico (use o IP da sua máquina)
const API_BASE_URL = 'http://192.168.x.x:3000';
```

## 📁 Estrutura do Projeto

```
mobile/
├── app/                    # Rotas (Expo Router)
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Dashboard
│   │   ├── schedule.tsx   # Agenda
│   │   ├── profile.tsx    # Perfil
│   │   └── settings.tsx   # Ajustes
│   ├── _layout.tsx        # Root layout
│   └── +not-found.tsx     # 404
├── assets/                # Imagens e fontes
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes de UI base
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Loading.tsx
│   │   └── Toast.tsx
│   └── LessonCard.tsx    # Card de aula
├── services/             # Serviços de API
│   ├── api.ts           # Configuração Axios
│   └── lessons.ts       # Endpoints de aulas/pagamentos
├── types/               # Tipos TypeScript
│   └── index.ts        # Tipos sincronizados com Prisma
├── global.css          # TailwindCSS
├── tailwind.config.js  # Configuração Tailwind
└── package.json
```

## 🎨 Design System

Baseado nas **Apple Design Guidelines** com:
- Cores primárias em azul (#0A84FF)
- Tipografia limpa e hierarquizada
- Cards com sombras suaves
- Feedback visual (Loading, Toasts)
- Animações fluidas

## 📦 Build para Produção

```bash
# Build para Android (APK/AAB)
eas build --platform android

# Build para iOS (IPA)
eas build --platform ios
```

## 📄 Licença

Projeto privado - GoDrive © 2025
