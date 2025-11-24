# ELEVARE GIT AGENT REPORT

---

**Data de Execução:** 2025-11-24 01:21:56 UTC
**Branch:** copilot/automate-repo-management-tasks
**Commit SHA:** 37ec5cf00252f5a4d390c1469f3b2d9dcbcbb7fa
**Autor:** copilot-swe-agent[bot]

---

## RESUMO EXECUTIVO

| Métrica | Valor |
|---------|-------|
| **Integridade da Branch** | **14%** |
| Checks Passaram | 1 / 7 |
| Erros de Lint |  |
| Erros TypeScript | 13 |
| Testes Falhados | 24 |
| Problemas de Segurança | 1 |
| Dependências Não Usadas | 1 |
| Avisos Críticos | 0
0 |

---

## CHECKS EXECUTADOS

| Check | Status |
|-------|--------|
| Instalação | ✅ SUCCESS |
| ESLint | ❌ FAILED |
| TypeScript | ❌ FAILED |
| Testes | ❌ FAILED |
| Segurança | ❌ FAILED |
| Dependências | ⚠️ WARNING |
| Avisos | ⚠️ WARNING |

---

## LOGS COMPLETOS

### 1. Instalação de Dependências

```

added 875 packages, and audited 876 packages in 22s

130 packages are looking for funding
  run `npm fund` for details

6 vulnerabilities (4 low, 2 high)

To address all issues, run:
  npm audit fix

Run `npm audit` for details.
```

### 2. ESLint

```json
{}
```

### 3. TypeScript Compilation

```
src/firebaseConfig.ts(5,31): error TS2307: Cannot find module 'firebase/app' or its corresponding type declarations.
src/modules/agendamentos/agendamentos.service.ts(162,5): error TS2322: Type 'Agendamento | null' is not assignable to type 'Agendamento | undefined'.
  Type 'null' is not assignable to type 'Agendamento | undefined'.
src/modules/auth/dto/login.dto.ts(2,3): error TS2564: Property 'idToken' has no initializer and is not definitely assigned in the constructor.
src/modules/auth/dto/register.dto.ts(2,3): error TS2564: Property 'email' has no initializer and is not definitely assigned in the constructor.
src/modules/auth/dto/register.dto.ts(3,3): error TS2564: Property 'senha' has no initializer and is not definitely assigned in the constructor.
src/modules/auth/dto/register.dto.ts(4,3): error TS2564: Property 'nome' has no initializer and is not definitely assigned in the constructor.
src/modules/auth/dto/register.dto.ts(5,3): error TS2564: Property 'clinicId' has no initializer and is not definitely assigned in the constructor.
src/modules/campanhas/entities/campanha.entity.ts(6,3): error TS2564: Property 'id' has no initializer and is not definitely assigned in the constructor.
src/modules/campanhas/entities/campanha.entity.ts(9,3): error TS2564: Property 'titulo' has no initializer and is not definitely assigned in the constructor.
src/modules/campanhas/entities/campanha.entity.ts(15,3): error TS2564: Property 'ativo' has no initializer and is not definitely assigned in the constructor.
src/modules/indicacoes/indicacoes.controller.ts(3,27): error TS2306: File '/home/runner/work/meu-backend/meu-backend/src/modules/indicacoes/entities/indicacao.entity.ts' is not a module.
src/modules/indicacoes/indicacoes.module.ts(5,27): error TS2306: File '/home/runner/work/meu-backend/meu-backend/src/modules/indicacoes/entities/indicacao.entity.ts' is not a module.
src/modules/indicacoes/indicacoes.service.ts(4,27): error TS2306: File '/home/runner/work/meu-backend/meu-backend/src/modules/indicacoes/entities/indicacao.entity.ts' is not a module.
```

### 4. Testes

```
     [90m    |[39m                                   [31m[1m^[22m[39m
     [90m 21 |[39m       providers[33m:[39m [
     [90m 22 |[39m         [33mAgendaSemanalService[39m[33m,[39m
     [90m 23 |[39m         {[0m

      at TestingInjector.lookupComponentInParentModules (../node_modules/@nestjs/core/injector/injector.js:262:19)
      at TestingInjector.resolveComponentInstance (../node_modules/@nestjs/core/injector/injector.js:215:33)
      at TestingInjector.resolveComponentInstance (../node_modules/@nestjs/testing/testing-injector.js:19:45)
      at resolveParam (../node_modules/@nestjs/core/injector/injector.js:129:38)
          at async Promise.all (index 0)
      at TestingInjector.resolveConstructorParams (../node_modules/@nestjs/core/injector/injector.js:144:27)
      at TestingInjector.loadInstance (../node_modules/@nestjs/core/injector/injector.js:70:13)
      at TestingInjector.loadProvider (../node_modules/@nestjs/core/injector/injector.js:98:9)
      at ../node_modules/@nestjs/core/injector/instance-loader.js:56:13
          at async Promise.all (index 3)
      at TestingInstanceLoader.createInstancesOfProviders (../node_modules/@nestjs/core/injector/instance-loader.js:55:9)
      at ../node_modules/@nestjs/core/injector/instance-loader.js:40:13
          at async Promise.all (index 1)
      at TestingInstanceLoader.createInstances (../node_modules/@nestjs/core/injector/instance-loader.js:39:9)
      at TestingInstanceLoader.createInstancesOfDependencies (../node_modules/@nestjs/core/injector/instance-loader.js:22:13)
      at TestingInstanceLoader.createInstancesOfDependencies (../node_modules/@nestjs/testing/testing-instance-loader.js:9:9)
      at TestingModuleBuilder.createInstancesOfDependencies (../node_modules/@nestjs/testing/testing-module.builder.js:118:9)
      at TestingModuleBuilder.compile (../node_modules/@nestjs/testing/testing-module.builder.js:74:9)
      at Object.<anonymous> (modules/campanhas/agenda-semanal.service.spec.ts:20:35)

FAIL services/eventos.service.spec.ts
  ● EventosService › lista eventos

    Nest can't resolve dependencies of the EventsService (?). Please make sure that the argument "EventRepository" at index [0] is available in the RootTestModule context.

    Potential solutions:
    - Is RootTestModule a valid NestJS module?
    - If "EventRepository" is a provider, is it part of the current RootTestModule?
    - If "EventRepository" is exported from a separate @Module, is that module imported within RootTestModule?
      @Module({
        imports: [ /* the Module containing "EventRepository" */ ]
      })

    [0m [90m 13 |[39m
     [90m 14 |[39m   beforeEach([36masync[39m () [33m=>[39m {
    [31m[1m>[22m[39m[90m 15 |[39m     [36mconst[39m module [33m=[39m [36mawait[39m [33mTest[39m[33m.[39mcreateTestingModule({
     [90m    |[39m                    [31m[1m^[22m[39m
     [90m 16 |[39m       providers[33m:[39m [
     [90m 17 |[39m         [33mEventosService[39m[33m,[39m
     [90m 18 |[39m         { provide[33m:[39m getRepositoryToken([33mEvento[39m)[33m,[39m useValue[33m:[39m mock() }[33m,[39m[0m

      at TestingInjector.lookupComponentInParentModules (../node_modules/@nestjs/core/injector/injector.js:262:19)
      at TestingInjector.resolveComponentInstance (../node_modules/@nestjs/core/injector/injector.js:215:33)
      at TestingInjector.resolveComponentInstance (../node_modules/@nestjs/testing/testing-injector.js:19:45)
      at resolveParam (../node_modules/@nestjs/core/injector/injector.js:129:38)
          at async Promise.all (index 0)
      at TestingInjector.resolveConstructorParams (../node_modules/@nestjs/core/injector/injector.js:144:27)
      at TestingInjector.loadInstance (../node_modules/@nestjs/core/injector/injector.js:70:13)
      at TestingInjector.loadProvider (../node_modules/@nestjs/core/injector/injector.js:98:9)
      at ../node_modules/@nestjs/core/injector/instance-loader.js:56:13
          at async Promise.all (index 3)
      at TestingInstanceLoader.createInstancesOfProviders (../node_modules/@nestjs/core/injector/instance-loader.js:55:9)
      at ../node_modules/@nestjs/core/injector/instance-loader.js:40:13
          at async Promise.all (index 1)
      at TestingInstanceLoader.createInstances (../node_modules/@nestjs/core/injector/instance-loader.js:39:9)
      at TestingInstanceLoader.createInstancesOfDependencies (../node_modules/@nestjs/core/injector/instance-loader.js:22:13)
      at TestingInstanceLoader.createInstancesOfDependencies (../node_modules/@nestjs/testing/testing-instance-loader.js:9:9)
      at TestingModuleBuilder.createInstancesOfDependencies (../node_modules/@nestjs/testing/testing-module.builder.js:118:9)
      at TestingModuleBuilder.compile (../node_modules/@nestjs/testing/testing-module.builder.js:74:9)
      at Object.<anonymous> (services/eventos.service.spec.ts:15:20)

FAIL services/auth.service.spec.ts
  ● Test suite failed to run

    [96msrc/services/auth.service.spec.ts[0m:[93m4[0m:[93m30[0m - [91merror[0m[90m TS2307: [0mCannot find module './users.service' or its corresponding type declarations.

    [7m4[0m import { UsersService } from './users.service';
    [7m [0m [91m                             ~~~~~~~~~~~~~~~~~[0m

FAIL services/bi.service.spec.ts
  ● BiService › gera metrics

    expect(received).toHaveProperty(path)

    Expected path: "total"
    Received path: []

    Received value: {}

    [0m [90m 14 |[39m   it([32m'gera metrics'[39m[33m,[39m [36masync[39m () [33m=>[39m {
     [90m 15 |[39m     [36mconst[39m res [33m=[39m [36mawait[39m service[33m.[39msummary()[33m;[39m
    [31m[1m>[22m[39m[90m 16 |[39m     expect(res)[33m.[39mtoHaveProperty([32m'total'[39m)[33m;[39m
     [90m    |[39m                 [31m[1m^[22m[39m
     [90m 17 |[39m   })[33m;[39m
     [90m 18 |[39m })[33m;[39m
     [90m 19 |[39m[0m

      at Object.<anonymous> (services/bi.service.spec.ts:16:17)


Test Suites: 12 failed, 15 passed, 27 total
Tests:       22 failed, 118 passed, 140 total
Snapshots:   0 total
Time:        56.339 s
Ran all test suites.
```

### 5. Segurança

```

```

### 6. NPM Audit

```json
{
  "auditReportVersion": 2,
  "vulnerabilities": {
    "@angular-devkit/schematics-cli": {
      "name": "@angular-devkit/schematics-cli",
      "severity": "low",
      "isDirect": false,
      "via": [
        "inquirer"
      ],
      "effects": [
        "@nestjs/cli"
      ],
      "range": "0.12.0-beta.0 - 18.1.0-rc.1",
      "nodes": [
        "node_modules/@angular-devkit/schematics-cli"
      ],
      "fixAvailable": true
    },
    "@nestjs/cli": {
      "name": "@nestjs/cli",
      "severity": "high",
      "isDirect": true,
      "via": [
        "@angular-devkit/schematics-cli",
        "glob",
        "inquirer"
      ],
      "effects": [],
      "range": "2.0.0-rc.1 - 10.4.9",
      "nodes": [
        "node_modules/@nestjs/cli"
      ],
      "fixAvailable": true
    },
    "external-editor": {
      "name": "external-editor",
      "severity": "low",
      "isDirect": false,
      "via": [
        "tmp"
      ],
      "effects": [
        "inquirer"
      ],
      "range": ">=1.1.1",
      "nodes": [
        "node_modules/external-editor"
      ],
      "fixAvailable": true
    },
    "glob": {
      "name": "glob",
      "severity": "high",
      "isDirect": false,
      "via": [
        {
          "source": 1109842,
          "name": "glob",
          "dependency": "glob",
          "title": "glob CLI: Command injection via -c/--cmd executes matches with shell:true",
          "url": "https://github.com/advisories/GHSA-5j98-mcp5-4vw2",
          "severity": "high",
          "cwe": [
            "CWE-78"
          ],
          "cvss": {
            "score": 7.5,
            "vectorString": "CVSS:3.1/AV:N/AC:H/PR:L/UI:N/S:U/C:H/I:H/A:H"
          },
          "range": ">=10.2.0 <10.5.0"
        }
      ],
      "effects": [
        "@nestjs/cli"
      ],
      "range": "10.2.0 - 10.4.5",
      "nodes": [
        "node_modules/glob"
      ],
      "fixAvailable": true
    },
    "inquirer": {
      "name": "inquirer",
      "severity": "low",
      "isDirect": false,
      "via": [
        "external-editor"
      ],
      "effects": [
        "@angular-devkit/schematics-cli",
        "@nestjs/cli"
      ],
      "range": "3.0.0 - 8.2.6 || 9.0.0 - 9.3.7",
      "nodes": [
        "node_modules/@angular-devkit/schematics-cli/node_modules/inquirer",
        "node_modules/inquirer"
      ],
      "fixAvailable": true
    },
```

---

## PORCENTAGEM REAL DE INTEGRIDADE DA BRANCH

**14%**

## CRITÉRIO DE EXCELÊNCIA

### ❌ REPROVADO

Branch não atende aos critérios mínimos.

**Problemas Detectados:**

- ❌ 13 erros TypeScript
- ❌ 24 testes falhados
- ❌ 1 problemas de segurança
- ⚠️ 1 dependências não usadas

**Status:** Reprovar até correções serem aplicadas.

---

## SUGESTÕES OBJETIVAS

1. Execute auto-fix: `./scripts/elevare_auto_fix.sh`
2. Crie PR automático: `./scripts/auto_fix_and_pr.sh`
3. Revise logs completos no diretório `reports/`
4. Corrija problemas que não podem ser automatizados
5. Re-execute este script após correções

---

**Fim do Relatório**

