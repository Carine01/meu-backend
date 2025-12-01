# 🚀 COMANDOS - PR WhatsApp + clinicId Filters

## 📋 Passo a Passo Completo

### 1️⃣ Criar branch
```powershell
cd backend
git checkout -b feat/whatsapp-clinicid-filters
```

### 2️⃣ Aplicar o patch
```powershell
# Aplicar todas as mudanças do patch
git apply patch-whatsapp-clinicid.patch
```

### 3️⃣ Revisar mudanças (opcional)
```powershell
# Ver arquivos modificados
git status

# Ver diferenças
git diff
```

### 4️⃣ Commitar
```powershell
# Adicionar todos os arquivos
git add .

# Commitar com mensagem descritiva
git commit -m "feat(whatsapp/clinicid): add whatsapp entity, service, controller, DTOs + clinicId filters scaffold"
```

### 5️⃣ Push da branch
```powershell
git push -u origin feat/whatsapp-clinicid-filters
```

### 6️⃣ Criar Pull Request

#### Opção A: Via GitHub CLI (gh)
```powershell
gh pr create --base main --head feat/whatsapp-clinicid-filters --title "feat(whatsapp/clinicid): clinicId filters + FilaService (Baileys) + DTOs/validation" --body-file .\PR_WHATSAPP_BODY.md --label "implementation","priority/high" --reviewer Carine01
```

#### Opção B: Via Web (se gh não funcionar)
1. Acesse: https://github.com/Carine01/meu-backend/compare/main...feat/whatsapp-clinicid-filters
2. Clique em "Create Pull Request"
3. Cole o conteúdo de `PR_WHATSAPP_BODY.md`
4. Adicione labels: `implementation`, `priority/high`

---

## 📦 Arquivos que serão criados pelo patch:

- `src/entities/whatsapp-message.entity.ts` - Entidade WhatsApp
- `src/dto/send-whatsapp.dto.ts` - DTO com validação
- `src/services/whatsapp.service.ts` - Service de persistência
- `src/services/fila.service.ts` - FilaService com Baileys
- `src/controllers/whatsapp.controller.ts` - Controller REST
- `src/module-whatsapp.ts` - Módulo WhatsApp
- Scaffolding de clinicId filters em 7 services

---

## ⚙️ Configuração Pós-Merge

### 1. Adicionar secrets no GitHub
```
Settings → Secrets and variables → Actions → New repository secret
```

Secrets necessários:
- `WHATSAPP_AUTH_PATH` - Caminho para auth/session do Baileys
- `DB_URL` - Connection string PostgreSQL
- `SSH_DEPLOY_KEY` - Chave SSH para deploy

### 2. Importar WhatsAppModule no AppModule

Editar `src/app.module.ts`:
```typescript
import { WhatsAppModule } from './module-whatsapp';

@Module({
  imports: [
    // ... outros módulos
    WhatsAppModule,
  ],
})
export class AppModule {}
```

### 3. Rodar testes localmente
```powershell
npm ci
npm run test
```

### 4. Teste em staging
```powershell
# Testar envio de mensagem
curl -X POST http://localhost:3000/whatsapp/send -H "Content-Type: application/json" -H "x-clinic-id: clinic-123" -d '{"phone":"5511999999999","message":"Test"}'

# Health check
curl http://localhost:3000/whatsapp/health
```

---

## 🔍 Verificação

### Listar branches
```powershell
git branch -a
```

### Ver status do PR
```powershell
gh pr status
```

### Ver detalhes do PR
```powershell
gh pr view feat/whatsapp-clinicid-filters
```

---

## 🐛 Troubleshooting

### Erro: "patch does not apply"
```powershell
# Verificar conflitos
git apply --check patch-whatsapp-clinicid.patch

# Aplicar com 3-way merge
git apply --3way patch-whatsapp-clinicid.patch
```

### Erro: "branch already exists"
```powershell
# Deletar branch local
git branch -D feat/whatsapp-clinicid-filters

# Deletar branch remota
git push origin --delete feat/whatsapp-clinicid-filters

# Criar novamente
git checkout -b feat/whatsapp-clinicid-filters
```

### Erro: "gh not found"
Use a Opção B (criar PR via web) no passo 6️⃣

---

## ✅ Checklist Final

- [ ] Branch criada: `feat/whatsapp-clinicid-filters`
- [ ] Patch aplicado sem erros
- [ ] Commit criado com mensagem convencional
- [ ] Push realizado para origin
- [ ] PR criado com labels corretas
- [ ] Secrets configurados no GitHub
- [ ] WhatsAppModule importado no AppModule
- [ ] Testes locais passando
- [ ] Health check funcionando

---

## 📚 Referências

- [Baileys Documentation](https://github.com/WhiskeySockets/Baileys)
- [NestJS Modules](https://docs.nestjs.com/modules)
- [Class Validator](https://github.com/typestack/class-validator)
