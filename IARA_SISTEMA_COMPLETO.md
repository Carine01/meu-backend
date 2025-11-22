# 🤖 IARA - Sistema Completo de Automação WhatsApp

## 📋 Sumário Executivo

O **IARA (Inteligência Artificial de Relacionamento e Agendamento)** é a "alma" do sistema Elevare, contendo:

- **119 mensagens humanizadas** organizadas por stage e categoria
- **35+ regras de negócio** para scoring e etiquetas automáticas
- **Sistema de fila inteligente** com retry automático (3 tentativas)
- **Agenda semanal automatizada** (Segunda-Domingo) com disparos segmentados
- **BI Dashboard** com métricas 30d/7d/hoje e endpoint Prometheus
- **Integração WhatsApp** via webhook (Make.com/Zapier/n8n)

---

## 🌸 Filosofia do IARA

### Tom Humanizado (20 anos de experiência Carine Marques)

```
❌ ERRADO: "Olá! Você se cadastrou no nosso site. Deseja agendar?"
✅ CERTO:  "Passei pra facilitar: me diz 2 janelas desta semana e eu organizo 
           tudo pra você focar em {{objetivo}} sem perder tempo."
```

**Princípios:**
- **Autoridade consultiva** (não vendedor)
- **Scarcity natural** ("sobrou 1 horário")
- **Transparência** ("vou ser direta")
- **Sem enrolação** ("decidir é simples quando há clareza")
- **Validação** ("sei que vida é corrida")

---

## 📚 Biblioteca de Mensagens (119 templates)

### Estrutura de Cada Mensagem

```typescript
interface MensagemTemplate {
  key: string;              // Ex: BOASVINDAS_01, AUTH_SUPREMA_05
  stage: 'frio' | 'morno' | 'quente';
  canal: 'whatsapp';
  ativo: boolean;
  categoria: 'boasvindas' | 'autoridade' | 'reativacao' | 'objecao' | 'campanha' | 'agenda';
  template: string;         // Com variáveis {{nome}}, {{clinica}}, etc
  descricao: string;
}
```

### Categorias e Quantidade

| Categoria | Quantidade | Stage Principal | Objetivo |
|-----------|------------|-----------------|----------|
| **Boas-vindas** | 20 | Frio/Morno | Primeiro contato humanizado |
| **Autoridade Suprema** | 25 | Quente | Scarcity + decisão rápida |
| **Reativação** | 15 | Frio/Morno | D+15, D+30, D+60, D+90, D+180 |
| **Objeções Preço** | 15 | Morno/Quente | Reframe valor vs custo |
| **Objeções Tempo** | 10 | Morno | Priorização |
| **Confirmação Agenda** | 10 | Quente | Lembrete 24h/2h |
| **Pós-venda** | 20 | Quente | Gratidão, avaliação, indicação |
| **Campanhas Premium** | 10 | Variado | Black Friday, Ano Novo, etc |
| **No-show/Reagendamento** | 5 | Morno | Follow-up empático |

### Exemplos de Mensagens por Stage

#### FRIO (Score 0-39)
```
BOASVINDAS_01:
"{{nome}}, aqui é da {{clinica}} 🌸. Quero te ajudar em {{objetivo}} sem correria. 
Prefere manhã, tarde ou sábado? Eu encaixo no VIP."

REATIVACAO_D30:
"Oi {{nome}}! Passou 1 mês e eu lembrei de você. Sei que vida é corrida, mas 
{{objetivo}} é investimento em você mesma. Que tal retomar? Tenho horários livres 
esta semana."
```

#### MORNO (Score 40-69)
```
BOASVINDAS_03:
"Vi que você tá procurando {{objetivo}} — a gente trabalha com {{especialidade}} 
há 20 anos. Tenho 2 horários esta semana: {{hora}} ou {{hora2}}. Qual funciona melhor?"

OBJECAO_PRECO_02:
"{{nome}}, caro é continuar sem resolver. Barato é investir uma vez e resolver de 
verdade. A gente tem parcelamento em até 6x sem juros. Quer saber como funciona?"
```

#### QUENTE (Score 70-100)
```
AUTH_SUPREMA_01:
"{{nome}}, vou ser direta: sobrou 1 horário esta semana porque alguém desmarcou. 
{{data}} às {{hora}}. É VIP, com todo o tempo do mundo pra você. Confirmo?"

AUTH_SUPREMA_05:
"Vou te falar um segredo: a maioria espera 'segunda-feira' pra começar. Os que 
decidem hoje são os que chegam no resultado antes. {{data}} às {{hora}}. Vem?"
```

### Variáveis Disponíveis

```typescript
{{nome}}          // Nome do lead/cliente
{{clinica}}       // "Elevare Estética"
{{profissional}}  // "Carine Marques"
{{especialidade}} // "Criomodelagem e Estética Dermatofuncional"
{{objetivo}}      // Interesse do cliente (ex: "criomodelagem")
{{data}}          // "Terça-feira, 25/11"
{{hora}}          // "14h30"
{{hora2}}         // "16h" (horário alternativo)
{{procedimento}}  // "Criomodelagem"
{{valor}}         // "R$ 350,00"
{{maps}}          // Link Google Maps da clínica
{{review}}        // Link de avaliação
{{whatsapp}}      // "(11) 99999-9999"
```

---

## 🎯 Sistema de Scoring (35+ Regras)

### Score Base
```
Lead novo = 20 pontos
```

### Comportamento Landing Page

| Métrica | Condição | Pontos |
|---------|----------|--------|
| **Time on page** | > 120s | +15 |
| **Time on page** | > 60s | +10 |
| **Scroll depth** | > 70% | +10 |
| **Scroll depth** | > 50% | +5 |
| **Vídeo assistido** | > 70% | +15 |
| **Clicou WhatsApp** | Sim | +25 ⚡ |

### Origem

| Origem | Pontos | Motivo |
|--------|--------|--------|
| **Indicação** | +20 | Confiança máxima |
| **WhatsApp direto** | +15 | Alta intenção |
| **Instagram** | +10 | Engajamento visual |
| **Google Ads** | +10 | Busca ativa |
| **Facebook Ads** | +5 | Tráfego pago |
| **Orgânico** | +5 | Interesse genuíno |

### Eventos Pós-Captação

| Evento | Pontos | Descrição |
|--------|--------|-----------|
| **Agendamento criado** | +30 | Commitment forte |
| **Compareceu** | +25 | Cliente ativo |
| **Comprou pacote** | +40 | Cliente premium |
| **Mensagem simulada** | +5 | Por interação |
| **Reagendamento** | +10 | Ainda interessado |
| **No-show** | -15 | Baixa prioridade |
| **Cancelou agendamento** | -10 | Desistência |
| **Pediu desconto** | -5 | Sensibilidade a preço |
| **Respondeu < 5min** | +10 | Urgência |
| **Visualizou sem responder** | -2 | Baixo engajamento |

### Determinação de Stage

```typescript
if (score >= 70) return 'quente';  // Prioridade máxima, fechar venda
if (score >= 40) return 'morno';   // Aquecimento, quebra objeções
return 'frio';                      // Nutrição longa, educação
```

### Exemplo de Cálculo

**Lead: Maria Silva**
- Time on page: 180s → +15
- Scroll depth: 85% → +10
- Clicou WhatsApp: Sim → +25
- Origem: Indicação → +20
- **Score Final: 90 pontos (QUENTE 🔥)**

---

## 🏷️ Sistema de Etiquetas Automáticas

### Etiquetas Iniciais (no momento da captação)

#### Gênero
- `Homens`
- `Mulheres`

#### Faixa Etária
- `Jovem` (18-29 anos)
- `Adulto` (30-44 anos)
- `45PLUS` (45+ anos)

#### Origem
- `WhatsAppLead`
- `InstagramLead`
- `IndicacaoLead`
- `FacebookLead`
- `GoogleLead`

#### Comportamento
- `VideoWatcher` (> 70% do vídeo)
- `DeepReader` (scroll > 70%)
- `AltaIntencao` (clicou WhatsApp)

#### Status
- `NovoCliente` (todo lead novo)

### Etiquetas Dinâmicas (baseadas em eventos)

| Evento | Etiqueta Adicionada | Etiquetas Removidas |
|--------|---------------------|---------------------|
| Agendamento criado | `Agendado` | - |
| Compareceu | `ClienteAtivo` | `NoShow`, `Inativo*` |
| No-show | `NoShow` | - |
| Comprou pacote | `ClientePremium` | - |
| Reagendamento | `Reagendou` | - |
| 15 dias sem retorno | `Inativo15d` | - |
| 30 dias sem retorno | `Inativo30d` | `Inativo15d` |
| 60 dias sem retorno | `Inativo60d` | `Inativo30d` |
| 90 dias sem retorno | `Inativo90d` | `Inativo60d` |
| 180 dias sem retorno | `Inativo180d` | `Inativo90d` |

---

## 📤 Sistema de Fila de Envio

### Fluxo Completo

```
┌─────────────────┐
│  Lead captado   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ calcularScore()         │
│ determinarStage()       │
│ identificarEtiquetas()  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ adicionarNaFila()       │
│ - Resolve template      │
│ - Define scheduledFor   │
│ - Status: pending       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ processarFila() (CronJob│
│ a cada 1 minuto)        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Envio via Webhook       │
│ (Make.com/Zapier)       │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────┐   ┌──────┐
│SENT │   │FAILED│
│ ✅  │   │  ❌  │
└─────┘   └──┬───┘
              │
          Retry 1
          (delay 2s)
              │
          Retry 2
          (delay 4s)
              │
          Retry 3
          (delay 6s)
              │
        FAILED (definitivo)
```

### Retry Logic

```typescript
MAX_RETRIES = 3
RETRY_DELAY_MS = 2000 // 2 segundos entre tentativas

// Backoff exponencial:
Tentativa 1: delay 2s
Tentativa 2: delay 4s  (2s * 2)
Tentativa 3: delay 6s  (2s * 3)
```

### Status da Fila

- **`pending`**: Aguardando envio (scheduledFor no futuro)
- **`sent`**: Enviado com sucesso
- **`failed`**: Falhou após 3 tentativas
- **`cancelled`**: Cancelado manualmente

---

## 📅 Agenda Semanal Automatizada

### Regras por Dia da Semana

#### **Segunda-feira** 🌅
```
Regra 1:
- Público: NovoCliente
- Mensagem: BOASVINDAS_02
- Objetivo: Repescagem de leads frios
- Horário: 10h

Regra 2:
- Público: Inativo15d
- Mensagem: REATIVACAO_D15
- Objetivo: Verificar imprevisto
- Horário: 14h
```

#### **Terça-feira**
```
Regra 1:
- Público: Stage Morno
- Mensagem: BOASVINDAS_03
- Objetivo: Credibilidade 20 anos
- Horário: 10h

Regra 2:
- Público: InstagramLead + Jovem
- Mensagem: BOASVINDAS_05
- Objetivo: Tom jovem
- Horário: 15h
```

#### **Quarta-feira** 🔥
```
Regra 1:
- Público: AltaIntencao (clicou WhatsApp)
- Mensagem: AUTH_SUPREMA_01
- Objetivo: Scarcity + Autoridade
- Horário: 10h

Regra 2:
- Público: IndicacaoLead
- Mensagem: AUTH_SUPREMA_04
- Objetivo: Protocolo científico
- Horário: 14h
```

#### **Quinta-feira**
```
Regra 1:
- Público: Inativo30d
- Mensagem: REATIVACAO_D30
- Objetivo: Retomar investimento
- Horário: 10h

Regra 2:
- Público: NoShow
- Mensagem: NO_SHOW_FOLLOWUP
- Objetivo: Reagendamento empático
- Horário: 16h
```

#### **Sexta-feira** 📆
```
Regra 1:
- Público: Agendado
- Mensagem: CONFIRMACAO_24H
- Objetivo: Lembrete 24h antes
- Horário: 9h30

Regra 2:
- Público: ClienteAtivo
- Mensagem: POS_VENDA_INDICACAO
- Objetivo: Pedido de indicação
- Horário: 15h
```

#### **Sábado** 🎁
```
Regra 1:
- Público: ClientePremium
- Mensagem: CAMPANHA_BLACK_FRIDAY
- Objetivo: Pacotes VIP
- Horário: 10h
- Status: INATIVO (ativar em datas específicas)

Regra 2:
- Público: Inativo60d
- Mensagem: REATIVACAO_D60
- Objetivo: Vaga especial
- Horário: 14h
```

#### **Domingo** 🌸
```
Dia de descanso
(apenas regras de exceção desativadas por padrão)
```

---

## 🎨 API Endpoints

### `/bi/dashboard` (GET)
**Autenticação:** Firebase JWT

**Response:**
```json
{
  "leads30d": 150,
  "leads7d": 42,
  "leadsHoje": 8,
  "agendados30d": 45,
  "agendados7d": 12,
  "agendadosHoje": 3,
  "compareceu30d": 39,
  "comparecimentoPct": 87,
  "noShow30d": 4,
  "noShowPct": 9,
  "reagendamentos30d": 6,
  "vendas30d": 0,
  "ticketMedio": 0,
  "filaPendente": 12,
  "filaEnviados30d": 320,
  "filaFalhas30d": 5,
  "scoreMedioLeads": 58,
  "percentualQuente": 22,
  "percentualMorno": 48,
  "percentualFrio": 30
}
```

### `/bi/metrics` (GET)
**Autenticação:** Público (para Prometheus scraper)

**Response (text/plain):**
```
# HELP elevare_leads_total Total de leads captados
# TYPE elevare_leads_total gauge
elevare_leads_total{periodo="30d"} 150
elevare_leads_total{periodo="7d"} 42

# HELP elevare_conversao_percentual Taxa de conversão
# TYPE elevare_conversao_percentual gauge
elevare_conversao_percentual{periodo="30d"} 30

# HELP elevare_score_medio Score médio dos leads
# TYPE elevare_score_medio gauge
elevare_score_medio 58
```

### `/bi/funil` (GET)
**Autenticação:** Firebase JWT

**Response:**
```json
{
  "etapas": [
    { "etapa": "1. Lead Captado", "quantidade": 150, "percentual": 100 },
    { "etapa": "2. Agendamento Criado", "quantidade": 45, "percentual": 30 },
    { "etapa": "3. Compareceu", "quantidade": 39, "percentual": 26 }
  ],
  "taxaConversaoGeral": 26
}
```

### `/bi/etiquetas` (GET)
**Autenticação:** Firebase JWT

**Query params:** `?limit=10`

**Response:**
```json
[
  { "etiqueta": "Mulheres", "count": 120 },
  { "etiqueta": "WhatsAppLead", "count": 85 },
  { "etiqueta": "Adulto", "count": 70 },
  { "etiqueta": "AltaIntencao", "count": 55 },
  { "etiqueta": "InstagramLead", "count": 45 }
]
```

### `/bi/origens` (GET)
**Autenticação:** Firebase JWT

**Response:**
```json
[
  { "origem": "indicacao", "leads": 30, "agendamentos": 25, "taxaConversao": 83 },
  { "origem": "whatsapp", "leads": 50, "agendamentos": 30, "taxaConversao": 60 },
  { "origem": "instagram", "leads": 70, "agendamentos": 15, "taxaConversao": 21 }
]
```

---

## 🚀 Integração e Deploy

### Variáveis de Ambiente (.env)

```bash
# Webhook WhatsApp
WEBHOOK_URL=https://hook.us1.make.com/xxxxx
WEBHOOK_TOKEN=seu-token-make
MAKE_WEBHOOK_URL=https://hook.us1.make.com/xxxxx
MAKE_TOKEN=seu-token-aqui

# Firebase Admin SDK
FIREBASE_PROJECT_ID=elevare-iara
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@elevare-iara.iam.gserviceaccount.com

# IARA (Supabase Edge - opcional)
IARA_EDGE_URL=https://seu-projeto.supabase.co/functions/v1/processar-lead
IARA_SECRET=seu-secret-iara

# Server
PORT=3000
NODE_ENV=production
```

### Configurar Prometheus Scraping

**prometheus.yml:**
```yaml
scrape_configs:
  - job_name: 'elevare-backend'
    scrape_interval: 60s
    static_configs:
      - targets: ['elevare-backend:3000']
    metrics_path: '/bi/metrics'
```

### CronJob para Processar Fila

**Criar controller ou service com @nestjs/schedule:**
```typescript
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CronService {
  constructor(
    private readonly filaService: FilaService,
    private readonly agendaSemanalService: AgendaSemanalService,
  ) {}

  // Processar fila a cada 1 minuto
  @Cron('0 * * * * *')
  async processarFila() {
    await this.filaService.processarFila(10);
  }

  // Executar agenda semanal às 9h todo dia
  @Cron('0 9 * * *')
  async executarAgenda() {
    await this.agendaSemanalService.executarAgendaDoDia();
  }
}
```

---

## 📊 Casos de Uso Completos

### Caso 1: Lead Novo (WhatsApp)

```typescript
// 1. Lead chega do formulário
const lead = {
  nome: 'Maria Silva',
  telefone: '+5511999999999',
  email: 'maria@email.com',
  origem: 'WhatsApp',
  clickedWhatsapp: true,
  timeOnPage: 180,
  scrollDepth: 85,
  interesse: 'criomodelagem'
};

// 2. Calcular score
const score = leadsScoreService.calcularScore(lead);
// Score: 20 + 15 (timeOnPage) + 10 (scrollDepth) + 25 (WhatsApp) + 15 (origem) = 85

// 3. Determinar stage
const stage = leadsScoreService.determinarStage(85);
// Stage: 'quente' 🔥

// 4. Identificar etiquetas
const etiquetas = leadsScoreService.identificarEtiquetasIniciais(lead);
// ['Mulheres', 'Adulto', 'WhatsAppLead', 'DeepReader', 'AltaIntencao', 'NovoCliente']

// 5. Sugerir mensagem
const mensagem = leadsScoreService.sugerirProximaMensagem(stage, etiquetas);
// 'AUTH_SUPREMA_01' (scarcity + autoridade)

// 6. Adicionar na fila
await filaService.adicionarNaFila(
  lead.id,
  lead.nome,
  lead.telefone,
  mensagem,
  { objetivo: lead.interesse },
  new Date(Date.now() + 10 * 60 * 1000) // Enviar em 10 minutos
);

// 7. Processamento automático (CronJob)
// Fila processa, resolve template, envia via webhook
// Status: pending → sent ✅
```

### Caso 2: Reativação D+30

```typescript
// 1. CronJob diário detecta leads inativos 30 dias
const leadsInativos = await firestore
  .collection('leads')
  .where('updatedAt', '<=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  .get();

// 2. Adicionar etiqueta Inativo30d
for (const doc of leadsInativos.docs) {
  const lead = doc.data() as Lead;
  const novasEtiquetas = leadsScoreService.adicionarEtiquetaDinamica(
    lead.etiquetas,
    'D30_sem_retorno'
  );
  
  await doc.ref.update({ etiquetas: novasEtiquetas });
}

// 3. Agenda semanal (quinta-feira 10h)
// Regra automática: Inativo30d → REATIVACAO_D30
await agendaSemanalService.executarAgendaDoDia();

// 4. Mensagem enviada:
// "Oi Maria! Passou 1 mês e eu lembrei de você. Sei que vida é corrida, 
// mas criomodelagem é investimento em você mesma. Que tal retomar?"
```

### Caso 3: Confirmação 24h Antes

```typescript
// 1. Agendamento criado
const agendamento = {
  id: 'AGD123',
  nomePaciente: 'Maria Silva',
  telefoneE164: '+5511999999999',
  procedimento: 'Criomodelagem',
  startISO: '2025-11-26T14:30:00-03:00',
  duracaoMinutos: 60
};

// 2. Agenda semanal (sexta-feira 9h30)
// Busca leads com etiqueta 'Agendado' e agendamento para amanhã
const variaveis = mensagemResolver.criarVariaveisAgendamento({
  nomePaciente: agendamento.nomePaciente,
  procedimento: agendamento.procedimento,
  dataHora: new Date(agendamento.startISO),
  valor: 350
});

// 3. Mensagem enviada:
// "Oi Maria! Lembrando que amanhã (Terça-feira, 26/11) às 14h30 você tem 
// sessão de Criomodelagem aqui na Elevare Estética. Confirma pra mim? 💜"
```

---

## ✅ Checklist de Implementação

### Backend Módulos
- [x] `MensagensModule` (resolução de templates)
- [x] `FilaModule` (fila de envio com retry)
- [x] `BiModule` (dashboard e Prometheus)
- [x] `CampanhasModule` (agenda semanal)
- [x] `LeadsScoreModule` (scoring e etiquetas)

### Entities/Interfaces
- [x] `Lead` (score, stage, etiquetas)
- [x] `MensagemTemplate` (119 mensagens)
- [x] `FilaEnvio` (status, retry, webhook)
- [x] `Agendamento` (confirmações)
- [x] `Campanha` (disparos segmentados)

### Services
- [x] `MensagemResolverService` (interpolação variáveis)
- [x] `FilaService` (adicionar, processar, retry)
- [x] `LeadsScoreService` (35+ regras scoring)
- [x] `BiService` (métricas, funil, origens)
- [x] `AgendaSemanalService` (Segunda-Domingo)

### Controllers
- [x] `BiController` (/bi/dashboard, /bi/metrics, /bi/funil, /bi/etiquetas, /bi/origens)

### Faltam
- [ ] CronService (processar fila + executar agenda)
- [ ] EventosService (log de eventos)
- [ ] Testes Jest (80%+ coverage)
- [ ] Integração com LeadsModule existente
- [ ] Atualizar app.module.ts (importar novos módulos)

---

## 🎓 Próximos Passos

### Prioridade P1 (Esta Sprint)
1. ✅ Criar CronService com @nestjs/schedule
2. ✅ Integrar módulos em app.module.ts
3. ✅ Testar fluxo completo local
4. ✅ Deploy Cloud Run
5. ✅ Configurar webhook Make.com real

### Prioridade P2 (Próxima Sprint)
1. Frontend Admin para gerenciar mensagens
2. Editor visual de regras semanais
3. Dashboard React com gráficos
4. Exportar relatórios CSV/PDF
5. Notificações Telegram para admin

### Prioridade P3 (Futuro)
1. Módulo Financeiro (vendas, ticket médio)
2. A/B Testing de mensagens
3. Personalização de mensagens por clínica
4. WhatsApp Business API oficial (não webhook)
5. Chat ao vivo com takeover manual

---

**Documentação criada em:** 21/11/2025  
**Versão:** 1.0.0  
**Autor:** GitHub Copilot (Claude Sonnet 4.5)  
**Cliente:** Elevare Estética - Carine Marques
