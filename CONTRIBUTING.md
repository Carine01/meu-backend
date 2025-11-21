# Contribuindo para meu-backend

Obrigado por considerar contribuir! 🎉

## 🚀 Como começar

1. **Fork do projeto**: Clique no botão "Fork" no GitHub
2. **Clone seu fork**:
   ```bash
   git clone https://github.com/seu-usuario/meu-backend.git
   cd meu-backend
   ```
3. **Instale as dependências**:
   ```bash
   npm install
   ```
4. **Configure as variáveis de ambiente**:
   ```bash
   cp .env.example .env
   # Edite o .env com suas configurações
   ```

## 🔧 Desenvolvendo

### Estrutura do projeto

```
src/
├── config/          # Configurações e validação de env vars
├── firestore/       # Módulo Firestore
├── health/          # Health checks
├── leads/           # Módulo de leads
└── main.ts          # Entrada da aplicação
```

### Comandos úteis

```bash
# Desenvolvimento
npm run start:dev       # Inicia em modo desenvolvimento

# Testes
npm test                # Executa todos os testes
npm run test:cov        # Testes com cobertura

# Code Quality
npm run lint            # Verifica problemas de código
npm run lint:fix        # Corrige problemas automaticamente
npm run format          # Formata o código
npm run format:check    # Verifica formatação

# Build
npm run build           # Build de produção
```

## 📝 Convenções de código

### Commits

Seguimos a convenção [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação (sem mudança de código)
- `refactor:` Refatoração de código
- `test:` Adicionar ou corrigir testes
- `chore:` Tarefas de build, dependências, etc.

Exemplos:
```bash
git commit -m "feat: adiciona endpoint de busca de leads"
git commit -m "fix: corrige validação de email no DTO"
git commit -m "docs: atualiza README com novos endpoints"
```

### Código TypeScript

- Use TypeScript estrito
- Evite `any`, prefira tipos específicos
- Documente funções complexas
- Escreva testes para novas funcionalidades
- Use async/await ao invés de Promises diretas

### Estilo

O projeto usa ESLint e Prettier para padronização:

```bash
npm run lint:fix    # Corrige automaticamente
npm run format      # Formata o código
```

**Nota**: Pre-commit hooks rodam automaticamente e garantem que o código está formatado.

## 🧪 Testes

### Escrevendo testes

- Teste unitários vão em `*.spec.ts` ao lado do arquivo testado
- Use Jest para testes
- Mock dependências externas (Firebase, APIs)
- Tente cobrir casos de erro também

Exemplo:
```typescript
describe('LeadsService', () => {
  it('deve criar um lead', async () => {
    const result = await service.create({ nome: 'Teste' });
    expect(result).toBeDefined();
  });
});
```

### Rodando testes

```bash
npm test              # Todos os testes
npm test -- leads     # Apenas testes de leads
npm run test:cov      # Com cobertura
```

## 🔀 Pull Requests

1. **Crie uma branch** a partir de `main`:
   ```bash
   git checkout -b feat/minha-feature
   ```

2. **Faça suas alterações** seguindo as convenções

3. **Commit frequentemente** com mensagens claras

4. **Push para seu fork**:
   ```bash
   git push origin feat/minha-feature
   ```

5. **Abra um Pull Request** no GitHub
   - Descreva claramente as mudanças
   - Referencie issues relacionadas
   - Aguarde review

### Checklist do PR

- [ ] Código segue as convenções do projeto
- [ ] Testes foram adicionados/atualizados
- [ ] Todos os testes passam
- [ ] Documentação foi atualizada se necessário
- [ ] Build está funcionando
- [ ] Lint não reporta erros

## 🐛 Reportando bugs

Ao reportar bugs, inclua:

- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs atual
- Versão do Node.js e do projeto
- Logs relevantes

## 💡 Sugerindo melhorias

Sugestões são bem-vindas! Abra uma issue descrevendo:

- Problema ou limitação atual
- Solução proposta
- Benefícios da mudança
- Exemplos de uso

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto (MIT).

---

**Dúvidas?** Abra uma issue ou entre em contato!

