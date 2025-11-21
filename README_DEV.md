# README_DEV — Backend Elevare Atendimento (Stalkspot)

Este documento descreve como configurar e rodar o backend localmente, especialmente a parte de autenticação com Firebase.

## Arquivos importantes
- `src/firebaseConfig.ts` — configuração client do Firebase (já incluída).
- `src/firebaseAdmin.ts` — inicializador do Firebase Admin SDK (usa service account via env ou arquivo).
- `src/firebase-auth.service.ts` — serviço que verifica tokens JWT usando `firebase-admin`.
- `src/firebase-auth.guard.ts` — guard para proteger rotas com token Firebase.
- `src/auth-test.controller.ts` — endpoint `/auth-test` para testar autenticação.
- `.env.example` — variáveis de ambiente necessárias.

## Variáveis de ambiente (colocar em `.env`)
- `PORT` (opcional, default 3000)
- `IARA_EDGE_URL`
- `IARA_SECRET`
- `FIREBASE_SERVICE_ACCOUNT_JSON` (opcional: conteúdo JSON da service account) OR
- `GOOGLE_APPLICATION_CREDENTIALS` (caminho para o JSON da service account no filesystem)

> Recomendação de segurança: não versionar o arquivo JSON da service account. Use um secret manager ou compartilhe de forma segura.

## Instalar dependências
```powershell
cd backend
npm install
```

## Build e Run
```powershell
npm run build
npm start
```

## Desenvolvimento com auto-reload
```powershell
npm run start:dev
```

## Testes rápidos
- Health: `curl http://localhost:3000/health`
- Auth test (token Firebase obrigatório):
  - `curl -H "Authorization: Bearer <ID_TOKEN>" http://localhost:3000/auth-test`
- Retry test (simula 500s): `curl -X POST http://localhost:3000/test/retry`

## Como obter o ID_TOKEN (no frontend)
1. Faça login com Firebase Auth (web/Android/iOS).  
2. No frontend, após login: `const idToken = await firebase.auth().currentUser.getIdToken();`  
3. Envie `Authorization: Bearer ${idToken}` nas requisições para o backend.

## Tarefas recomendadas após entrega
1. Configurar CI/CD para injetar service account via secrets.  
2. Validar todas as rotas protegidas por `FirebaseAuthGuard`.  
3. Implementar rotinas de rotação e revogação de chaves.  

## Contato
Se precisar que eu gere a integração com Firestore ou exemplos de frontend para login, posso criar isso também.
