import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

async function fixEntities() {
  console.log('🔧 Iniciando correção de entities...\n');
  
  // Busca todas as entities
  const entityFiles = await glob('src/**/entities/*.entity.ts', { 
    cwd: process.cwd(),
    absolute: true 
  });
  
  let totalFixed = 0;
  
  for (const filePath of entityFiles) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Corrige properties sem definite assignment
    // @Column() name: string; → @Column() name!: string;
    content = content.replace(
      /@(Column|PrimaryColumn|PrimaryGeneratedColumn|CreateDateColumn|UpdateDateColumn|DeleteDateColumn|ManyToOne|OneToMany|ManyToMany|OneToOne)\([^)]*\)\s+(\w+):\s*(string|number|boolean|Date)(\[\])?;/g,
      '@$1($2) $3!: $4$5;'
    );
    
    // Corrige properties com ? opcional que não precisam de !
    content = content.replace(/(\w+)\?!:/g, '$1?:');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corrigido: ${path.relative(process.cwd(), filePath)}`);
      totalFixed++;
    }
  }
  
  console.log(`\n🎉 Total de arquivos corrigidos: ${totalFixed}`);
  console.log('\n📋 Próximos passos:');
  console.log('1. Execute: npm run build');
  console.log('2. Corrija catch blocks: find src/ -name "*.ts" -type f -exec sed -i "s/catch (error)/catch (error: any)/g" {} \\;');
}

fixEntities().catch(console.error);
