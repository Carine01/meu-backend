import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClinicIdToTables1700000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Adicionar coluna clinic_id às tabelas principais
    await queryRunner.query(`
      ALTER TABLE indicacoes 
      ADD COLUMN IF NOT EXISTS clinic_id VARCHAR(50) NOT NULL DEFAULT 'ELEVARE_MAIN';
    `);

    await queryRunner.query(`
      ALTER TABLE recompensas 
      ADD COLUMN IF NOT EXISTS clinic_id VARCHAR(50) NOT NULL DEFAULT 'ELEVARE_MAIN';
    `);

    await queryRunner.query(`
      ALTER TABLE fila_envios 
      ADD COLUMN IF NOT EXISTS clinic_id VARCHAR(50) NOT NULL DEFAULT 'ELEVARE_MAIN';
    `);

    await queryRunner.query(`
      ALTER TABLE eventos 
      ADD COLUMN IF NOT EXISTS clinic_id VARCHAR(50) NOT NULL DEFAULT 'ELEVARE_MAIN';
    `);

    await queryRunner.query(`
      ALTER TABLE agendamentos 
      ADD COLUMN IF NOT EXISTS clinic_id VARCHAR(50) NOT NULL DEFAULT 'ELEVARE_MAIN';
    `);

    await queryRunner.query(`
      ALTER TABLE bloqueios 
      ADD COLUMN IF NOT EXISTS clinic_id VARCHAR(50) NOT NULL DEFAULT 'ELEVARE_MAIN';
    `);

    // 2. Criar índices compostos para performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_indicacoes_clinic_indicador 
      ON indicacoes(clinic_id, indicador_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_recompensas_clinic_lead 
      ON recompensas(clinic_id, lead_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_fila_clinic_status 
      ON fila_envios(clinic_id, status);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_eventos_clinic_lead 
      ON eventos(clinic_id, lead_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_agendamentos_clinic_lead 
      ON agendamentos(clinic_id, lead_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_bloqueios_clinic_data 
      ON bloqueios(clinic_id, data);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices
    await queryRunner.query(`DROP INDEX IF EXISTS idx_bloqueios_clinic_data;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_agendamentos_clinic_lead;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_eventos_clinic_lead;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_fila_clinic_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_recompensas_clinic_lead;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_indicacoes_clinic_indicador;`);

    // Remover colunas
    await queryRunner.query(`ALTER TABLE bloqueios DROP COLUMN IF EXISTS clinic_id;`);
    await queryRunner.query(`ALTER TABLE agendamentos DROP COLUMN IF EXISTS clinic_id;`);
    await queryRunner.query(`ALTER TABLE eventos DROP COLUMN IF EXISTS clinic_id;`);
    await queryRunner.query(`ALTER TABLE fila_envios DROP COLUMN IF EXISTS clinic_id;`);
    await queryRunner.query(`ALTER TABLE recompensas DROP COLUMN IF EXISTS clinic_id;`);
    await queryRunner.query(`ALTER TABLE indicacoes DROP COLUMN IF EXISTS clinic_id;`);
  }
}

