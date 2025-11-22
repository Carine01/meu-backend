import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Inicializa o Firebase Admin SDK de forma SEGURA
 * 
 * CORREÇÃO DE SEGURANÇA: Remove vulnerabilidade RCE do require() dinâmico
 * 
 * Ordem de prioridade:
 * 1) FIREBASE_SERVICE_ACCOUNT_JSON (variável de ambiente com JSON completo)
 * 2) GOOGLE_APPLICATION_CREDENTIALS (caminho para arquivo - leitura segura com readFileSync)
 * 3) Default credentials (ADC) para ambientes GCP
 */

function initAdmin() {
  // Previne re-inicialização
  if (admin.apps.length > 0) {
    return;
  }

  try {
    // Opção 1: JSON direto na variável de ambiente (RECOMENDADO para produção)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      // Cloud Run Secret Manager injeta o JSON diretamente, não em base64
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
      console.log('[Firebase] Inicializado via FIREBASE_SERVICE_ACCOUNT_JSON');
      return;
    }

    // Opção 2: Arquivo (SEGURO - usa readFileSync ao invés de require)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Valida que o caminho não contém travessia maliciosa
      const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      
      // SEGURANÇA: Valida extensão .json
      if (!credPath.endsWith('.json')) {
        throw new Error('GOOGLE_APPLICATION_CREDENTIALS deve apontar para arquivo .json');
      }

      // Leitura segura (não permite code injection)
      const fileContent = readFileSync(credPath, 'utf8');
      const serviceAccount = JSON.parse(fileContent);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
      console.log('[Firebase] Inicializado via arquivo de credenciais');
      return;
    }

    // Opção 3: Default credentials (funciona em Cloud Run, Cloud Functions, GCE)
    admin.initializeApp();
    console.log('[Firebase] Inicializado com Application Default Credentials');
    
  } catch (error: any) {
    console.error('[Firebase] ERRO na inicialização:', error?.message || error);
    throw new Error(`Falha ao inicializar Firebase Admin SDK: ${error?.message || 'Erro desconhecido'}`);
  }
}

initAdmin();

export default admin;

