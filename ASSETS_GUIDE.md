# Guia de Assets - GoDrive Mobile

## Dimensões Obrigatórias para Lojas

### iOS (App Store)

| Asset | Dimensão | Formato |
|-------|----------|---------|
| **App Icon** | 1024x1024px | PNG (sem alpha) |
| **Splash Screen** | 2732x2732px | PNG |

### Android (Google Play)

| Asset | Dimensão | Formato |
|-------|----------|---------|
| **App Icon** | 512x512px | PNG |
| **Adaptive Icon (foreground)** | 1024x1024px | PNG (com safe zone) |
| **Adaptive Icon (background)** | 1024x1024px | PNG ou cor sólida |
| **Splash Screen** | 1284x2778px | PNG |
| **Feature Graphic** | 1024x500px | PNG/JPG |

## Configuração Expo (app.json)

```json
{
  "expo": {
    "icon": "./assets/images/icon.png",
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#1E3A8A"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#1E3A8A"
      }
    }
  }
}
```

## Identidade Visual Delta Pro

### Cores Principais

| Cor | Hex | Uso |
|-----|-----|-----|
| **Azul Profissional** | `#1E3A8A` | Marca principal, headers, botões primários |
| **Azul Secundário** | `#2563EB` | Links, destaques |
| **Verde Sucesso** | `#10B981` | Confirmações, saldo positivo, sucesso |
| **Branco** | `#FFFFFF` | Backgrounds, textos em fundos escuros |
| **Cinza Neutro** | `#6B7280` | Textos secundários |

### Logo GoDrive

O ícone deve conter:
- Fundo: Azul Profissional (#1E3A8A)
- Símbolo: Letra "G" estilizada em branco
- Cantos arredondados (iOS: super ellipse, Android: circular)

### Safe Zone (Adaptive Icon Android)

```
┌─────────────────────────────────────┐
│                                     │
│   ┌─────────────────────────────┐   │
│   │                             │   │
│   │     ┌───────────────┐       │   │
│   │     │               │       │   │
│   │     │   SAFE ZONE   │       │   │
│   │     │   (logo aqui) │       │   │
│   │     │               │       │   │
│   │     └───────────────┘       │   │
│   │                             │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘

Margem externa: 18% de cada lado
Safe zone central: 66% do total
```

## Arquivos Necessários

Criar os seguintes arquivos em `assets/images/`:

### 1. icon.png (1024x1024)
- Ícone principal do app
- Fundo: #1E3A8A
- Logo "G" centralizado em branco
- Sem transparência para iOS

### 2. adaptive-icon.png (1024x1024)  
- Foreground do adaptive icon Android
- Fundo: Transparente
- Logo "G" centralizado (dentro da safe zone de 66%)

### 3. splash-icon.png (200x200 ou maior)
- Logo para a splash screen
- Será centralizado sobre backgroundColor #1E3A8A
- Fundo transparente recomendado

### 4. favicon.png (48x48)
- Para versão web
- Versão simplificada do ícone

## Ferramentas Recomendadas

1. **Figma** - Design dos assets
2. **App Icon Generator** - https://appicon.co/
3. **Android Asset Studio** - Para adaptive icons
4. **Expo Icon Builder** - Integrado no EAS

## Comando para Verificar Assets

```bash
# Verificar configuração de assets
npx expo-doctor

# Gerar assets automaticamente (requer imagem base)
npx expo customize
```

## Checklist de Publicação

- [ ] icon.png (1024x1024) criado
- [ ] adaptive-icon.png (1024x1024) criado  
- [ ] splash-icon.png criado
- [ ] favicon.png (48x48) criado
- [ ] Cores consistentes com brand Delta Pro
- [ ] Safe zones respeitadas no adaptive icon
- [ ] Testado em emulador Android
- [ ] Testado em simulador iOS
