# Como Capturar Screenshots Reais do App

## Método 1: Usando Expo CLI (Recomendado)

### 1. Inicie o servidor Expo
```bash
cd c:\Projetos\godrive-mobile
npx expo start
```

### 2. Abra o app no simulador iOS
- Pressione `i` para abrir no iOS Simulator
- Ou use o Expo Go no seu dispositivo iOS

### 3. Navegue até as telas desejadas
- **Home**: Tela inicial do instrutor
- **Perfil**: Vá em Perfil → Editar Perfil
- **SAC**: Vá em Configurações → Privacidade e Segurança → SAC

### 4. Capture screenshots usando o iOS Simulator
- No iOS Simulator: `Cmd + Shift + 4` (seleção de área)
- Ou: `Cmd + Shift + 3` (tela inteira)
- Salve diretamente na pasta `apple_screenshots`

### 5. Redimensione para iPad 13" (2048x2732)
Use um editor de imagens (Photoshop, GIMP, ou ferramenta online) para:
- Redimensionar para exatamente 2048x2732 pixels
- Manter a proporção e qualidade
- Remover qualquer moldura do simulador

## Método 2: Usando EAS Build (Automático)

### 1. Crie um perfil de screenshots no eas.json
```json
{
  "build": {
    "production": { ... },
    "screenshots": {
      "ios": {
        "device": "iPad Pro (13-inch)",
        "path": "./apple_screenshots"
      }
    }
  }
}
```

### 2. Execute o comando de screenshots
```bash
npx eas screenshot --platform ios --device "iPad Pro (13-inch)"
```

## Método 3: Usando Fastlane (Avançado)

### 1. Instale o Fastlane
```bash
brew install fastlane
```

### 2. Crie um Fastfile
```ruby
lane :screenshots do
  capture_screenshots(
    scheme: "godrive-instrutor",
    device: "iPad Pro (13-inch)",
    output_directory: "./apple_screenshots",
    reinstall_app: true
  )
end
```

### 3. Execute
```bash
fastlane screenshots
```

## Arquivos Necessários

Para iPad 13" você precisa:
- **3 screenshots** no formato 2048x2732 pixels
- **Sem molduras** ou bordas do simulador
- **Alta qualidade** (PNG ou JPEG)
- **Conteúdo real** do seu app

## Telas Recomendadas

1. **Home**: Dashboard principal com cards
2. **Perfil**: Tela de perfil com foto e configurações
3. **SAC**: Formulário de contato do SAC

## Dicas

- Use dados reais no app (nome, email, etc.)
- Certifique-se de que o app está em modo produção (sem logs de debug)
- Teste todas as funcionalidades antes de capturar
- Verifique se não há avisos ou erros visíveis
