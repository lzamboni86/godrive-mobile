# Componentes de Layout Padrão

## ScreenLayout

Componente wrapper que garante SafeAreaView consistente em todas as telas.

### Uso Básico
```tsx
import { ScreenLayout } from '@/components/layout/ScreenLayout';

export default function MyScreen() {
  return (
    <ScreenLayout backgroundColor="bg-white" topPadding={32}>
      {/* Conteúdo da tela */}
    </ScreenLayout>
  );
}
```

### Props
- `backgroundColor`: Classe de cor de fundo (padrão: 'bg-white')
- `edges`: SafeAreaView edges (padrão: ['top', 'bottom'])
- `topPadding`: Padding superior em pixels (padrão: 0)
- `bottomPadding`: Padding inferior em pixels (padrão: 0)
- `horizontalPadding`: Padding horizontal em pixels (padrão: 0)

## HeaderLayout

Componente para cabeçalhos consistentes com padding adequado.

### Uso Básico
```tsx
import { HeaderLayout } from '@/components/layout/ScreenLayout';

export default function MyScreen() {
  return (
    <ScreenLayout>
      <HeaderLayout 
        title="Minha Agenda"
        subtitle="Aulas confirmadas e agendadas"
      />
      {/* Resto do conteúdo */}
    </ScreenLayout>
  );
}
```

## Padrão Recomendado

Para telas com cabeçalho:
```tsx
<ScreenLayout backgroundColor="bg-neutral-50" topPadding={32}>
  <HeaderLayout 
    title="Título da Tela"
    subtitle="Descrição opcional"
  />
  {/* Conteúdo principal */}
</ScreenLayout>
```

Para telas sem cabeçalho:
```tsx
<ScreenLayout backgroundColor="bg-white" topPadding={32}>
  {/* Conteúdo direto */}
</ScreenLayout>
```

## Benefícios

1. **Consistência**: Todas as telas terão o mesmo espaçamento em relação à barra de status
2. **Manutenibilidade**: Mudanças globais de layout podem ser feitas em um só lugar
3. **Segurança**: Evita sobreposição com ícones do sistema
4. **Flexibilidade**: Props permitem customização quando necessário
