#!/usr/bin/env node
/**
 * Valida as variáveis de ambiente antes de iniciar a aplicação
 * Executa: node scripts/validate-env.js
 */

const fs = require('fs');
const path = require('path');

// Cores para terminal
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Variáveis obrigatórias para desenvolvimento
const requiredDevVars = ['PORT'];

// Variáveis obrigatórias para produção
const requiredProdVars = [
  'PORT',
  'NODE_ENV',
  'FIREBASE_SERVICE_ACCOUNT_JSON',
  'IARA_EDGE_URL',
  'IARA_SECRET',
];

// Variáveis opcionais mas recomendadas
const optionalVars = ['DEFAULT_CLINIC', 'DEFAULT_ORIGEM', 'ALLOWED_ORIGINS'];

function validateEnvironment() {
  const isProduction = process.env.NODE_ENV === 'production';
  const requiredVars = isProduction ? requiredProdVars : requiredDevVars;

  log('blue', '\n🔍 Validando variáveis de ambiente...\n');

  let hasError = false;
  let hasWarning = false;

  // Verificar variáveis obrigatórias
  log('blue', `Ambiente: ${isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}\n`);

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      log('red', `❌ ERRO: Variável obrigatória ${varName} não definida`);
      hasError = true;
    } else {
      log('green', `✓ ${varName}`);
    }
  });

  // Verificar variáveis opcionais
  console.log('');
  optionalVars.forEach((varName) => {
    if (!process.env[varName]) {
      log('yellow', `⚠️  AVISO: Variável opcional ${varName} não definida`);
      hasWarning = true;
    } else {
      log('green', `✓ ${varName}`);
    }
  });

  // Verificar arquivo .env em desenvolvimento
  if (!isProduction) {
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
      log('yellow', '\n⚠️  Arquivo .env não encontrado');
      log('yellow', '   Copie .env.example para .env e configure as variáveis');
      hasWarning = true;
    }
  }

  // Resultado final
  console.log('');
  if (hasError) {
    log('red', '❌ Validação FALHOU - Corrija os erros antes de continuar');
    log('yellow', '\nDica: Copie .env.example para .env e preencha as variáveis');
    process.exit(1);
  } else if (hasWarning) {
    log('yellow', '⚠️  Validação OK com avisos - A aplicação pode não funcionar completamente');
  } else {
    log('green', '✅ Validação OK - Todas as variáveis estão configuradas!');
  }

  console.log('');
}

// Executar apenas se for chamado diretamente
if (require.main === module) {
  validateEnvironment();
}

module.exports = { validateEnvironment };
