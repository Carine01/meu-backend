# ✅ CHECKLIST DEV — ELEVARE

Entrega limpa, sem desculpas, sem ruído.

---

## 🎯 Antes de Começar Qualquer Tarefa

- [ ] **Branch main atualizada**
  ```bash
  git checkout main
  git pull origin main
  ```

- [ ] **Ambiente limpo**
  ```bash
  rm -rf node_modules dist .cache 2>/dev/null || true
  ```

- [ ] **Dependências instaladas**
  ```bash
  npm ci
  ```

---

## 🔨 Durante o Desenvolvimento

### Build

- [ ] **TypeScript compila sem erros**
  ```bash
  npm run build
  ```

- [ ] **Sem warnings críticos** (warnings normais são ok)

### Testes

- [ ] **Testes unitários passam**
  ```bash
  npm test
  ```

- [ ] **Testes E2E passam** (se aplicável)
  ```bash
  npm run test:e2e
  ```

- [ ] **Cobertura de código adequada** (>80% idealmente)
  ```bash
  npm run test:coverage
  ```

### Code Quality

- [ ] **Código formatado**
  ```bash
  npm run format  # se disponível
  ```

- [ ] **Linter sem erros**
  ```bash
  npm run lint  # se disponível
  ```

- [ ] **Sem console.logs de debug** (usar logger estruturado)

---

## 🐳 Docker & Ambiente Local

- [ ] **Backend sobe com Docker Compose**
  ```bash
  ./docker-deploy.sh
  # OU
  docker compose up -d
  ```

- [ ] **Containers rodando corretamente**
  ```bash
  docker compose ps
  # Todos devem estar "Up" e "healthy"
  ```

- [ ] **Logs sem erros críticos**
  ```bash
  docker compose logs backend | tail -50
  ```

---

## 🏥 Health Checks

- [ ] **Endpoint principal responde**
  ```bash
  curl http://localhost:3000/health
  # Deve retornar 200 OK
  ```

- [ ] **Endpoint WhatsApp responde**
  ```bash
  curl http://localhost:3000/whatsapp/health
  # Deve retornar 200 OK
  ```

- [ ] **Health check completo**
  ```bash
  ./health-check.sh
  # Todos os testes devem passar
  ```

---

## 📱 Integrações (Se Aplicável)

- [ ] **WhatsApp testado**
  ```bash
  ./whatsapp-test.sh
  # Deve enviar mensagem com sucesso
  ```

- [ ] **Webhooks testados** (Make.com, Zapier, etc.)

- [ ] **Firebase conectado** (se necessário)

---

## 🔐 Segurança & Configuração

- [ ] **Variáveis de ambiente configuradas**
  ```bash
  cp .env.example .env
  # Preencher todas as variáveis necessárias
  ```

- [ ] **Sem credenciais no código**
  ```bash
  git grep -i "password\|secret\|key" src/
  # Não deve retornar credenciais reais
  ```

- [ ] **Sem commits de arquivos sensíveis**
  ```bash
  # Verificar .gitignore
  cat .gitignore | grep -E "\.env$|\.env\.local"
  ```

---

## 📚 Documentação

- [ ] **README atualizado** (se mudou funcionalidades)

- [ ] **API documentada** (se criou/alterou endpoints)

- [ ] **Comentários no código** (funções complexas)

- [ ] **JSDoc nas funções públicas** (se aplicável)

---

## 🔄 Git & GitHub

### Commits

- [ ] **Commits atômicos** (um commit = uma funcionalidade)

- [ ] **Mensagens descritivas**
  ```
  ✅ BOM: "feat: adicionar filtro clinicId em campanhas service"
  ❌ RUIM: "fix", "update", "wip"
  ```

- [ ] **Branch criada a partir da main atualizada**
  ```bash
  git checkout main
  git pull origin main
  git checkout -b feature/minha-feature
  ```

### Pull Request

- [ ] **PR criado com descrição clara**
  ```bash
  ./create-pr.sh
  # OU manualmente com título e descrição detalhados
  ```

- [ ] **Checklist no PR preenchido**

- [ ] **Screenshots adicionados** (se mudanças visuais)

- [ ] **Breaking changes documentadas** (se houver)

---

## 🚀 CI/CD & Deploy

### GitHub Actions

- [ ] **Workflows passando**
  ```bash
  ./monitor-actions.sh
  # OU
  gh run list
  ```

- [ ] **Sem falhas no CI**

- [ ] **Build de produção testado**
  ```bash
  NODE_ENV=production npm run build
  ```

### Deploy

- [ ] **Testado localmente antes do deploy**

- [ ] **Variáveis de produção verificadas**

- [ ] **Rollback plan definido** (se deploy grande)

- [ ] **Monitoramento ativo pós-deploy** (primeiros 15 min)

---

## 📊 Checklist Específico: Filtros clinicId

Se estiver implementando filtros clinicId:

- [ ] **Where clause adicionado** em todas as queries
  ```typescript
  where: { clinicId: user.clinicId }
  ```

- [ ] **Validação de entrada** com class-validator
  ```typescript
  @IsString()
  @IsNotEmpty()
  clinicId: string;
  ```

- [ ] **Testes unitários** para cada serviço

- [ ] **Testes E2E** para cada endpoint

- [ ] **Migração de banco** (se necessário)

- [ ] **Documentação atualizada**

---

## 🎯 Antes de Marcar PR como "Ready for Review"

- [ ] **Todos os itens acima verificados** ✓

- [ ] **Código revisado por você mesmo** (self-review)

- [ ] **Testado em ambiente similar à produção**

- [ ] **Performance verificada** (sem queries N+1, etc.)

- [ ] **Logs adequados** (não demais, não de menos)

- [ ] **Error handling implementado**

---

## 📋 Checklist Final (Antes do Merge)

- [ ] **Aprovação de pelo menos 1 reviewer**

- [ ] **Todos os comentários resolvidos**

- [ ] **CI/CD verde** (todos os checks passando)

- [ ] **Branch atualizada com main**
  ```bash
  git checkout main
  git pull origin main
  git checkout minha-branch
  git merge main
  ```

- [ ] **Conflitos resolvidos** (se houver)

- [ ] **Última verificação manual** (smoke test)

---

## 🚨 Red Flags (Não Permitido!)

❌ **Commits direto na main** (sempre usar branches)  
❌ **Testes quebrados** ("vou consertar depois")  
❌ **Build falhando** ("funciona na minha máquina")  
❌ **Credenciais hardcoded**  
❌ **console.log() em produção** (usar logger)  
❌ **Código comentado** (deletar, não comentar)  
❌ **TODOs não resolvidos** em PRs de produção  
❌ **Dependências desatualizadas com vulnerabilidades**  

---

## 🎓 Automação Disponível

Use os scripts do PAINEL DE COMANDO para acelerar:

```bash
# Sincronização completa
./elevare-ops.sh

# Deploy Docker
./docker-deploy.sh

# Health checks
./health-check.sh

# Criar PR
./create-pr.sh

# Monitorar CI
./monitor-actions.sh watch

# Deploy produção
./deploy-production.sh
```

---

## 📈 Métricas de Qualidade

Seu código deve ter:

- ✅ **Cobertura de testes:** >80%
- ✅ **Performance:** Endpoints <500ms
- ✅ **Build time:** <2 minutos
- ✅ **Zero vulnerabilidades** de alta severidade
- ✅ **Logs estruturados** (JSON format)
- ✅ **Error rate:** <1% em produção

---

## 🏆 Nível de Excelência

**Bronze:** Todos os itens obrigatórios ✓  
**Prata:** + Documentação completa + Testes >85%  
**Ouro:** + Performance otimizada + Zero vulnerabilidades  
**Platina:** + Monitoramento + Alertas + Logs estruturados  

---

**🎯 Meta: Entrega sempre no nível Ouro ou superior!**

---

## 💡 Dica Final

> "Se você não pode explicar simplesmente, você não entende bem o suficiente."  
> — Albert Einstein

Aplique isso ao seu código:
- Se está complicado, refatore
- Se precisa de muito comentário, simplifique
- Se não consegue testar, redesenhe

**Código bom é código simples, testável e manutenível.**

---

**🚀 ELEVARE — Qualidade sem compromissos**
