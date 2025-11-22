# 🤖 CONFIGURAÇÃO DE AUTONOMIA - GITHUB COPILOT

> **Como dar autonomia ao Copilot para trabalhar enquanto você descansa**

---

## ✅ PERMISSÕES GERAIS (Cole isto no chat)

```
AUTORIZAÇÃO PERMANENTE - CARINE

Você (GitHub Copilot) está autorizado a executar AUTOMATICAMENTE as seguintes ações, SEM pedir confirmação:

✅ PODE FAZER SEMPRE:
1. Criar/modificar arquivos de configuração (.env.example, .gitignore, etc)
2. Criar/modificar scripts em /scripts/
3. Criar/modificar documentação (.md)
4. Corrigir erros de TypeScript (imports, tipos, etc)
5. Adicionar logs e comentários
6. Criar testes unitários/E2E
7. Otimizar código existente (refactoring)
8. Aplicar boas práticas (ESLint, Prettier)
9. Atualizar dependências (package.json)
10. Criar arquivos de exemplo e templates

❌ NUNCA FAÇA SEM PERGUNTAR:
1. Deletar arquivos de produção
2. Modificar docker-compose.yml em produção
3. Alterar .env de produção
4. Fazer deploy
5. Executar comandos destrutivos (rm -rf, drop database, etc)
6. Modificar configurações de segurança críticas
7. Alterar estrutura do banco de dados em produção

⚠️ PERGUNTE ANTES:
1. Modificar entities existentes (adicionar/remover campos)
2. Alterar lógica de negócio crítica
3. Modificar configurações do Firebase
4. Mudar estrutura de pastas principais
5. Alterar endpoints da API (breaking changes)

🎯 CRITÉRIOS DE DECISÃO:
- Se não quebra nada existente → FAÇA
- Se melhora código/docs → FAÇA  
- Se tem risco de quebrar → PERGUNTE
- Se é irreversível → PERGUNTE

Assinado digitalmente: Carine
Data: 22/11/2025
```

---

## 🚀 COMANDOS RÁPIDOS (Cole quando precisar)

### **"Modo Autonomia Total"**
```
MODO AUTONOMIA ATIVADO

Trabalhe nas seguintes tarefas SEM pedir confirmação:
1. [Liste as tarefas]
2. [...]
3. [...]

Regras:
- Crie backups antes de modificar
- Documente todas as mudanças
- Gere relatório final
- Me avise apenas se encontrar BLOQUEIO

Pode começar!
```

### **"Correção Automática"**
```
CORREÇÃO AUTOMÁTICA ATIVADA

Corrija TODOS os erros TypeScript/ESLint que encontrar em:
- src/modules/*/
- src/config/
- src/*.ts

Pode modificar imports, tipos, etc.
Não precisa confirmar cada arquivo.
Me mostre apenas o resumo final.
```

### **"Documentação Automática"**
```
DOCUMENTAÇÃO AUTOMÁTICA

Crie/atualize documentação para:
- Todos os services em src/modules/
- Todos os endpoints (Swagger)
- README de cada módulo

Use JSDoc, Swagger decorators, etc.
Não precisa confirmar cada arquivo.
```

### **"Otimização em Background"**
```
OTIMIZAÇÃO EM BACKGROUND

Otimize o que achar necessário:
- Performance de queries
- Uso de memória
- Queries N+1
- Imports não utilizados
- Código duplicado

Crie PR virtual com todas as mudanças.
```

---

## 🎯 TEMPLATES DE AUTORIZAÇÃO

### **Template 1: Tarefa Específica**
```
AUTORIZAÇÃO ESPECÍFICA

Tarefa: [Descreva a tarefa]
Arquivos afetados: [Liste ou use "qualquer arquivo necessário"]
Prazo: [Imediato / Quando possível]
Restrições: [Liste ou "Nenhuma"]

Status: AUTORIZADO ✅
```

### **Template 2: Sessão Completa**
```
SESSÃO AUTÔNOMA - [Duração]

Durante as próximas [X horas/até eu voltar], você pode:
✅ [Lista de permissões]

Objetivos:
1. [Objetivo 1]
2. [Objetivo 2]
...

Quando terminar, gere relatório com:
- O que foi feito
- O que deu certo
- O que precisa de atenção
- Próximos passos

Status: ATIVA ✅
```

### **Template 3: Projeto Completo**
```
AUTONOMIA DE PROJETO

Projeto: [Nome]
Objetivo: [Objetivo geral]
Prazo: [Flexível / Até data X]

Você tem autonomia TOTAL para:
✅ Criar estrutura de arquivos
✅ Implementar lógica
✅ Criar testes
✅ Documentar
✅ Otimizar

Apenas me consulte em:
❓ Decisões de arquitetura
❓ Breaking changes
❓ Escolha de tecnologias novas

Status: AUTORIZADO ✅
```

---

## 🔄 WORKFLOW RECOMENDADO

### **Quando você sair:**
```
SAINDO POR [X TEMPO]

Enquanto isso, trabalhe em:
1. [Tarefa prioritária]
2. [Tarefa secundária]
3. [Se sobrar tempo]

Regras:
- Commits pequenos e frequentes
- Testes para tudo que criar
- Documentação inline

Volto em [X tempo]. Pode começar! 👋
```

### **Quando voltar:**
```
VOLTEI! 👋

Me mostre:
1. O que você fez (resumo)
2. O que funcionou
3. O que precisa de atenção
4. Próximos passos

Formato: Bullet points, máximo 20 linhas
```

---

## 🎓 EXEMPLOS REAIS

### **Exemplo 1: Documentação**
```
Cole no chat:

"AUTONOMIA ATIVADA - Documentação

Documente TODOS os services em src/modules/:
- JSDoc completo
- Exemplos de uso
- Parâmetros explicados
- Retornos documentados

Pode começar! Não precisa confirmar cada arquivo."
```

### **Exemplo 2: Testes**
```
Cole no chat:

"AUTONOMIA ATIVADA - Testes

Crie testes unitários para TODOS os services que não têm.
Estrutura:
- Testes básicos (CRUD)
- Testes de erro
- Mocks necessários

Pode começar! Me avise só no final."
```

### **Exemplo 3: Refactoring**
```
Cole no chat:

"AUTONOMIA ATIVADA - Refactoring

Refatore src/modules/leads/ aplicando:
- Princípios SOLID
- Design Patterns onde apropriado
- Tipagem forte
- Tratamento de erros

Crie backup antes. Pode começar!"
```

---

## 🛡️ SEGURANÇA

### **Backups Automáticos**
```
"Antes de modificar qualquer arquivo crítico, crie backup:

Arquivo.backup
Arquivo.original
Arquivo.old

Se algo der errado, reverter é trivial."
```

### **Teste Antes de Commit**
```
"Depois de cada mudança significativa:

1. npm run build
2. npm run test
3. npm run lint

Se todos passarem → Commit
Se falhar → Me avise"
```

---

## 📊 RELATÓRIO AUTOMÁTICO

```
"No final da sessão autônoma, gere este relatório:

# 📊 RELATÓRIO DE SESSÃO AUTÔNOMA

**Duração:** [X horas]
**Data:** [Data]

## ✅ Concluído
- [Item 1] - [Tempo gasto]
- [Item 2] - [Tempo gasto]

## ⚠️ Atenção Necessária
- [Item que precisa de decisão sua]

## 🐛 Problemas Encontrados
- [Problema 1] - [Status: Resolvido/Pendente]

## 📈 Próximos Passos
1. [Próximo passo 1]
2. [Próximo passo 2]

## 📁 Arquivos Modificados
- [Lista de arquivos]

## 🧪 Status dos Testes
- ✅ [X] passando
- ❌ [Y] falhando (detalhes abaixo)
"
```

---

## 🎯 ATALHOS RÁPIDOS

| Comando | Cola no chat |
|---------|--------------|
| **Autonomia Total** | `MODO AUTONOMIA - Faça o que for necessário` |
| **Só Correções** | `CORRIJA TUDO - Não pergunte` |
| **Só Docs** | `DOCUMENTE TUDO - Não pergunte` |
| **Só Testes** | `TESTE TUDO - Não pergunte` |
| **Parar** | `PAUSAR AUTONOMIA - Aguardar instruções` |

---

## 💡 DICAS

1. **Seja específico nas autorizações** - Evita ambiguidade
2. **Defina limites claros** - O que pode e não pode
3. **Peça relatórios** - Sempre saiba o que foi feito
4. **Use backups** - Segurança em primeiro lugar
5. **Teste incrementalmente** - Não acumule mudanças sem testar

---

## 🚀 COMEÇAR AGORA

Cole isto no chat agora:

```
AUTONOMIA ATIVADA ✅

Você está autorizado a trabalhar nas seguintes tarefas SEM confirmação:

1. Criar script de relatório final (relatorio-final.ps1)
2. Criar .env.example completo
3. Criar script de pré-checagem (pre-check.ps1)
4. Criar guia de início rápido (INICIO_RAPIDO.md)
5. Adicionar logs nos services críticos
6. Documentar endpoints faltantes

Regras:
✅ Crie backups se modificar arquivos existentes
✅ Teste cada script antes de finalizar
✅ Documente inline
✅ Gere relatório final

Pode começar AGORA! 🚀
```

---

<div align="center">

**🤖 Configure uma vez, use sempre**  
*Copilot trabalhando enquanto você descansa*

</div>
