import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { execSync } from 'child_process';

async function addClinicIdToEntities() {
  console.log('🏥 Adicionando clinicId às entities...\n');
  
  const entityFiles = await glob('src/**/entities/*.entity.ts', {
    cwd: process.cwd(),
    absolute: true
  });
  
  let modified = 0;
  
  for (const filePath of entityFiles) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Pula se já tem clinicId
    if (content.includes('clinicId')) {
      console.log(`⏭️  Já possui clinicId: ${path.basename(filePath)}`);
      continue;
    }
    
    // Pula entities de sistema (Usuario, Evento genéricos)
    if (filePath.includes('usuario.entity') || filePath.includes('auth')) {
      console.log(`⏭️  Entity de sistema (ignorada): ${path.basename(filePath)}`);
      continue;
    }
    
    // Adiciona clinicId após @Entity()
    const clinicIdField = `
  @Column({ type: 'varchar', length: 50, default: 'ELEVARE_MAIN' })
  clinicId!: string;
`;
    
    // Injeta após a declaração da classe
    content = content.replace(
      /(@Entity\([^)]*\)\s+export class \w+ {)/,
      `$1${clinicIdField}`
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Adicionado clinicId: ${path.relative(process.cwd(), filePath)}`);
    modified++;
  }
  
  console.log(`\n🎉 Total de entities modificadas: ${modified}`);
  
  if (modified > 0) {
    console.log('\n📦 Gerando migration...');
    try {
      execSync('npm run typeorm:generate -- src/migrations/AddClinicIdToEntities', {
        stdio: 'inherit'
      });
      console.log('✅ Migration criada com sucesso!');
    } catch (error) {
      console.error('⚠️  Erro ao gerar migration (rode manualmente depois)');
    }
  }
  
  console.log('\n📋 Próximos passos:');
  console.log('1. Revise as entities modificadas');
  console.log('2. Execute: npm run migration:run');
  console.log('3. Atualize os services para filtrar por clinicId');
}

addClinicIdToEntities().catch(console.error);
