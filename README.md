# meu-backend

Backend NestJS com integração Firebase.

## Como rodar localmente
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env` e preencha as variáveis (Firebase e backend).
3. Inicie o servidor:
   ```bash
   npm run start:dev
   ```

## Como fazer deploy
Veja o arquivo `CHECKLIST_DEPLOY.md` para um passo a passo completo de deploy em produção.

## Variáveis de ambiente
Veja o arquivo `.env.example` para todas as variáveis necessárias (Firebase, URLs, segredos, etc.).

## Scripts principais
- `npm run start:dev` — inicia em modo desenvolvimento
- `npm run build` — gera build de produção
- `npm run start:prod` — inicia em modo produção
- `npm run test` — executa os testes

## Sincronização com Git
Para manter seu repositório local atualizado com o repositório remoto:

### Opção 1: Comando manual
```bash
git pull origin main
```

### Opção 2: Script automatizado (recomendado)
```bash
# Linux/Mac
./scripts/git-pull.sh

# Windows PowerShell
.\scripts\git-pull.ps1
```

Os scripts automatizados:
- ✅ Salvam alterações locais automaticamente
- ✅ Fazem pull com rebase para histórico limpo
- ✅ Restauram suas alterações após o pull
- ✅ Instalam dependências se necessário
- ✅ Tratam conflitos de forma segura

📖 **Guia completo:** Veja [GIT_PULL_GUIDE.md](./GIT_PULL_GUIDE.md) para mais detalhes sobre como usar git pull.

## Documentação
- [NestJS](https://docs.nestjs.com/)
- [Firebase](https://firebase.google.com/docs)
- [Git Pull Guide](./GIT_PULL_GUIDE.md) - Guia completo sobre sincronização com Git

---

> Projeto criado por Carine01
