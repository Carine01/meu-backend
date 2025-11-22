import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import * as admin from 'firebase-admin';

/**
 * Script para limpar dados de teste do Firestore
 * Execute: npm run clean:test-data
 */
async function cleanTestData() {
  console.log('🧹 Iniciando limpeza de dados de teste do Firestore...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  // Padrões que identificam dados de teste
  const testPatterns = [
    /teste/i,
    /test/i,
    /fulano/i,
    /ciclano/i,
    /beltrano/i,
    /exemplo/i,
    /dummy/i,
    /fake/i,
    /sample/i,
    /demo/i,
    /asdf/i,
    /123456789/,
    /000000000/,
    /999999999/,
  ];

  try {
    const db = admin.firestore();
    
    // Coleções para limpar
    const collections = ['leads', 'agendamentos', 'mensagens'];
    let totalDeleted = 0;

    for (const collectionName of collections) {
      console.log(`\n📂 Verificando coleção: ${collectionName}`);
      
      const collectionRef = db.collection(collectionName);
      const snapshot = await collectionRef.get();

      if (snapshot.empty) {
        console.log(`   ✅ Coleção vazia, nada a fazer`);
        continue;
      }

      const batch = db.batch();
      let batchCount = 0;
      let deletedInCollection = 0;

      for (const doc of snapshot.docs) {
        const data = doc.data();
        const nome = data.nome || '';
        const email = data.email || '';
        const phone = data.phone || data.whatsapp || data.telefone || '';
        const clinicId = data.clinicId || '';

        // Verifica se algum campo corresponde aos padrões de teste
        const isTestData = testPatterns.some(
          (pattern) =>
            pattern.test(nome) ||
            pattern.test(email) ||
            pattern.test(phone) ||
            pattern.test(clinicId),
        );

        if (isTestData) {
          console.log(`   ❌ Deletando: ${nome} (${phone}) - ID: ${doc.id}`);
          batch.delete(doc.ref);
          batchCount++;
          deletedInCollection++;

          // Firestore batch tem limite de 500 operações
          if (batchCount >= 500) {
            await batch.commit();
            console.log(`   💾 Batch de 500 registros deletados...`);
            batchCount = 0;
          }
        }
      }

      // Commit do batch restante
      if (batchCount > 0) {
        await batch.commit();
      }

      if (deletedInCollection > 0) {
        console.log(`   ✅ ${deletedInCollection} registros de teste deletados de ${collectionName}`);
        totalDeleted += deletedInCollection;
      } else {
        console.log(`   ✅ Nenhum dado de teste encontrado em ${collectionName}`);
      }
    }

    console.log(`\n🎉 Limpeza concluída! Total de ${totalDeleted} registros deletados.`);
  } catch (error: any) {
    console.error('❌ Erro ao limpar dados:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Confirmação antes de executar
console.log('⚠️  ATENÇÃO: Este script irá deletar permanentemente dados de teste!');
console.log('📋 Padrões de detecção: teste, fulano, dummy, 123456789, etc.\n');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question('Digite "SIM" para confirmar a limpeza: ', (answer: string) => {
  readline.close();
  
  if (answer.trim().toUpperCase() === 'SIM') {
    cleanTestData();
  } else {
    console.log('❌ Operação cancelada.');
    process.exit(0);
  }
});

