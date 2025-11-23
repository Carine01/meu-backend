# Instruções para Componentes React

## Estrutura de Componentes

### Organização de Arquivos
```
frontend/src/
├── components/
│   ├── common/          # Componentes reutilizáveis
│   ├── layout/          # Componentes de layout
│   └── features/        # Componentes específicos de features
├── hooks/               # Custom hooks
├── services/            # Serviços de API
├── utils/               # Utilitários
└── types/               # Definições de tipos TypeScript
```

## Padrões de Componentes

### Componentes Funcionais
- **SEMPRE** use componentes funcionais com hooks
- **EVITE** componentes de classe

```typescript
import React from 'react';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <div>
      <h1>{title}</h1>
      {onAction && <button onClick={onAction}>Ação</button>}
    </div>
  );
};
```

### Hooks Personalizados
- Prefixo sempre com `use`
- Separe lógica complexa em hooks reutilizáveis

```typescript
export const useApiData = <T,>(endpoint: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Lógica de fetch
  }, [endpoint]);

  return { data, loading, error };
};
```

## Boas Práticas

### Props
1. **Defina interfaces TypeScript** para todas as props
2. **Use destructuring** nas props
3. **Documente props complexas** com JSDoc

### Estado
1. **useState**: Para estado local simples
2. **useReducer**: Para estado complexo com múltiplas ações
3. **Context API**: Para estado global quando necessário
4. **Custom hooks**: Para lógica de fetch reutilizável (considere React Query/SWR para projetos maiores)

### Performance
1. **Use React.memo** para componentes que renderizam com frequência
2. **useCallback** para funções passadas como props
3. **useMemo** para cálculos custosos
4. **Lazy loading** para componentes pesados

```typescript
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
```

### Estilização
- Use módulos CSS ou styled-components
- Mantenha consistência com o design system
- Evite inline styles excessivos

### Acessibilidade
- Use tags semânticas HTML
- Adicione atributos ARIA quando necessário
- Teste navegação por teclado
- Garanta contraste adequado de cores

## Testes

### Testes de Componentes
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render title', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should call onAction when button is clicked', () => {
    const mockAction = jest.fn();
    render(<MyComponent title="Test" onAction={mockAction} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockAction).toHaveBeenCalledTimes(1);
  });
});
```

## Integração com Backend

### Chamadas de API
- Use axios ou fetch através de serviços
- Implemente tratamento de erros consistente
- Mostre loading states apropriados

```typescript
const fetchData = async () => {
  try {
    setLoading(true);
    const response = await apiService.getData();
    setData(response.data);
  } catch (error) {
    setError(error);
  } finally {
    setLoading(false);
  }
};
```

### Autenticação
- Use contexto de autenticação
- Redirecione usuários não autenticados
- Armazene tokens de forma segura

## Checklist de Revisão

- [ ] Componente segue padrões de nomenclatura
- [ ] Props têm tipos TypeScript definidos
- [ ] Componente está acessível (ARIA, semântica)
- [ ] Performance otimizada (memo, callback, lazy)
- [ ] Testes cobrem casos principais
- [ ] Sem console.log em código de produção
- [ ] Tratamento de erros implementado
- [ ] Loading states considerados
