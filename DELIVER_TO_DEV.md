# Entrega para o programador — Backend Elevare Atendimento

Inclua estes arquivos/pastas ao enviar o projeto ao desenvolvedor responsável. Forneça o Service Account JSON via canal seguro (1Password, vault, link temporário).

Arquivos essenciais:
- `backend/` (pasta inteira)
- `backend/package.json`
- `backend/.env.example`
- `backend/tsconfig.json`
- `backend/src/firebaseConfig.ts`
- `backend/src/firebaseAdmin.ts`
- `backend/src/firebase-auth.service.ts`
- `backend/src/firebase-auth.guard.ts`
- `backend/src/auth-test.controller.ts`
- `backend/src/firestore/` (controller + service)
- `backend/src/leads/` (lógica de leads)
- `backend/src/config/config.schema.ts`
- `backend/src/health/health.controller.ts`
- `k8s/` (manifests: `deployment_backend_healthchecks.yaml`, `secret.yaml`, `externalsecret_example.yaml`)
- `observabilidade/` (prometheus/grafana)
- `backend/README_DEV.md` (instruções de dev)
- `backend/DELIVER_TO_DEV.md` (este arquivo)

Credenciais a fornecer separadamente (NUNCA commitar no repo):
- Firebase Service Account JSON (arquivo) — entregar via canal seguro.
- Variáveis de ambiente em `.env` (IARA_EDGE_URL, IARA_SECRET, DATABASE_URL, etc.)

Passos rápidos que o dev deve seguir após receber os arquivos:
1. Colocar Service Account em local seguro e setar `GOOGLE_APPLICATION_CREDENTIALS` ou `FIREBASE_SERVICE_ACCOUNT_JSON`.
2. `cd backend && npm install`
3. `npm run build && npm start` (ou `npm run start:dev` para dev)
4. Testar endpoints: `/health`, `/auth-test` (com token), `/firestore` CRUD, `/test/retry`.

Se precisar, eu posso gerar um arquivo ZIP com todos os arquivos essenciais — peça que eu gere o pacote e eu organizo tudo.
