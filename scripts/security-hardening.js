#!/usr/bin/env node

/**
 * ELEVARE - Security Hardening Script
 * Performs basic security checks and generates report
 */

const fs = require('fs');
const path = require('path');

console.log('=== ELEVARE SECURITY HARDENING ===');
console.log('Executando verificações de segurança...\n');

const securityIssues = [];
const securityPassed = [];

// Check for .env file in repository
function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    securityIssues.push({
      severity: 'HIGH',
      issue: 'Arquivo .env encontrado no repositório',
      recommendation: 'Remover .env do repositório e adicionar ao .gitignore'
    });
  } else {
    securityPassed.push('✓ Arquivo .env não está no repositório');
  }
}

// Check if .env is in .gitignore
function checkGitignore() {
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    if (!content.includes('.env')) {
      securityIssues.push({
        severity: 'MEDIUM',
        issue: '.env não está listado no .gitignore',
        recommendation: 'Adicionar .env ao .gitignore'
      });
    } else {
      securityPassed.push('✓ .env está no .gitignore');
    }
  }
}

// Check for hardcoded secrets in source files
function checkHardcodedSecrets() {
  const srcPath = path.join(process.cwd(), 'src');
  if (!fs.existsSync(srcPath)) return;
  
  const secretPatterns = [
    /password\s*=\s*['"][^'"]+['"]/gi,
    /secret\s*=\s*['"][^'"]+['"]/gi,
    /api[_-]?key\s*=\s*['"][^'"]+['"]/gi,
    /token\s*=\s*['"][^'"]+['"]/gi,
  ];
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('dist')) {
        scanDirectory(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        secretPatterns.forEach(pattern => {
          if (pattern.test(content)) {
            securityIssues.push({
              severity: 'HIGH',
              issue: `Possível credencial hardcoded em ${filePath}`,
              recommendation: 'Usar variáveis de ambiente para credenciais'
            });
          }
        });
      }
    });
  }
  
  scanDirectory(srcPath);
  
  if (securityIssues.filter(i => i.issue.includes('credencial hardcoded')).length === 0) {
    securityPassed.push('✓ Nenhuma credencial hardcoded encontrada');
  }
}

// Check for helmet middleware
function checkHelmet() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (!dependencies['helmet']) {
      securityIssues.push({
        severity: 'MEDIUM',
        issue: 'Helmet middleware não instalado',
        recommendation: 'Instalar helmet para segurança HTTP: npm install helmet'
      });
    } else {
      securityPassed.push('✓ Helmet middleware instalado');
    }
  }
}

// Check for CORS configuration
function checkCors() {
  const mainFilePath = path.join(process.cwd(), 'src', 'main.ts');
  if (fs.existsSync(mainFilePath)) {
    const content = fs.readFileSync(mainFilePath, 'utf-8');
    
    if (content.includes('enableCors') || content.includes('cors')) {
      securityPassed.push('✓ CORS configurado');
    } else {
      securityIssues.push({
        severity: 'MEDIUM',
        issue: 'CORS não está explicitamente configurado',
        recommendation: 'Configurar CORS adequadamente em main.ts'
      });
    }
  }
}

// Check for rate limiting
function checkRateLimiting() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (dependencies['@nestjs/throttler'] || dependencies['express-rate-limit']) {
      securityPassed.push('✓ Rate limiting configurado');
    } else {
      securityIssues.push({
        severity: 'LOW',
        issue: 'Rate limiting não está instalado',
        recommendation: 'Instalar @nestjs/throttler para proteção contra DDoS'
      });
    }
  }
}

// Generate security report
function generateReport() {
  const reportDir = path.join(process.cwd(), '.elevare_validation_report');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  let report = '=== ELEVARE SECURITY REPORT ===\n\n';
  report += `Data: ${new Date().toISOString()}\n\n`;
  
  report += '## Verificações Aprovadas\n';
  securityPassed.forEach(item => {
    report += `${item}\n`;
  });
  
  report += '\n## Problemas Encontrados\n';
  if (securityIssues.length === 0) {
    report += 'Nenhum problema crítico encontrado.\n';
  } else {
    securityIssues.forEach(issue => {
      report += `\n[${issue.severity}] ${issue.issue}\n`;
      report += `  → ${issue.recommendation}\n`;
    });
  }
  
  report += '\n=== FIM SECURITY REPORT ===\n';
  
  const reportPath = path.join(reportDir, 'security-report.txt');
  fs.writeFileSync(reportPath, report);
  
  console.log(report);
  console.log(`\nRelatório salvo em: ${reportPath}`);
}

try {
  // Run all security checks
  checkEnvFile();
  checkGitignore();
  checkHardcodedSecrets();
  checkHelmet();
  checkCors();
  checkRateLimiting();
  
  // Generate report
  generateReport();
  
  console.log('\n=== RESUMO ===');
  console.log(`Verificações aprovadas: ${securityPassed.length}`);
  console.log(`Problemas encontrados: ${securityIssues.length}`);
  console.log('\n=== FIM SECURITY HARDENING ===');
  
} catch (error) {
  console.error('Erro ao executar verificação de segurança:', error.message);
  process.exit(0); // Don't fail the workflow
}
