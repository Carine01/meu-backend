import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

/**
 * Teste E2E CRÍTICO: Agendamento com Bloqueios Dinâmicos
 * Tempo estimado: 60min
 */
describe('[CRITICO] Fluxo de Agendamento com Bloqueios (e2e)', () => {
  let app: INestApplication;
  let leadId: string;
  let clinicId = 'ELEVARE_MAIN';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('1️⃣ Deve criar lead para agendamento', async () => {
    const response = await request(app.getHttpServer())
      .post('/leads')
      .send({
        nome: 'Carlos Paciente',
        telefone: '+5511999999995',
      })
      .expect(201);

    leadId = response.body.id;
  });

  it('2️⃣ Deve criar bloqueios de almoço (12h-14h)', async () => {
    await request(app.getHttpServer())
      .post(`/agendamentos/bloqueios/almoco/${clinicId}`)
      .expect(201);
  });

  it('3️⃣ Deve criar bloqueios de sábados (após 14h)', async () => {
    await request(app.getHttpServer())
      .post(`/agendamentos/bloqueios/sabados/${clinicId}`)
      .expect(201);
  });

  it('4️⃣ Deve criar bloqueios de feriados nacionais', async () => {
    await request(app.getHttpServer())
      .post(`/agendamentos/bloqueios/feriados/${clinicId}`)
      .expect(201);
  });

  it('5️⃣ Deve REJEITAR agendamento no horário de almoço', async () => {
    const dataAlmoco = new Date();
    dataAlmoco.setHours(13, 0, 0, 0); // 13:00

    await request(app.getHttpServer())
      .post('/agendamentos')
      .send({
        leadId,
        clinicId,
        dataHora: dataAlmoco.toISOString(),
        duracao: 60,
        tipo: 'consulta',
      })
      .expect(400);
  });

  it('6️⃣ Deve REJEITAR agendamento em feriado (Natal)', async () => {
    await request(app.getHttpServer())
      .post('/agendamentos')
      .send({
        leadId,
        clinicId,
        dataHora: '2025-12-25T10:00:00',
        duracao: 60,
        tipo: 'consulta',
      })
      .expect(400);
  });

  it('7️⃣ Deve REJEITAR agendamento sábado após 14h', async () => {
    // Encontra próximo sábado
    const proximoSabado = new Date();
    proximoSabado.setDate(proximoSabado.getDate() + ((6 - proximoSabado.getDay() + 7) % 7));
    proximoSabado.setHours(15, 0, 0, 0); // 15:00

    await request(app.getHttpServer())
      .post('/agendamentos')
      .send({
        leadId,
        clinicId,
        dataHora: proximoSabado.toISOString(),
        duracao: 60,
        tipo: 'consulta',
      })
      .expect(400);
  });

  it('8️⃣ Deve ACEITAR agendamento em horário válido', async () => {
    const dataValida = new Date();
    dataValida.setDate(dataValida.getDate() + 1); // Amanhã
    dataValida.setHours(10, 0, 0, 0); // 10:00

    const response = await request(app.getHttpServer())
      .post('/agendamentos')
      .send({
        leadId,
        clinicId,
        dataHora: dataValida.toISOString(),
        duracao: 60,
        tipo: 'consulta',
      })
      .expect(201);

    expect(response.body.status).toBe('agendado');
  });

  it('9️⃣ Deve verificar se horário está bloqueado', async () => {
    const response = await request(app.getHttpServer())
      .get(`/agendamentos/bloqueios/verificar/${clinicId}`)
      .query({
        data: '2025-12-25',
        hora: '10:00',
        duracao: 60,
      })
      .expect(200);

    expect(response.body.bloqueado).toBe(true);
    expect(response.body.motivo).toContain('Natal');
  });

  it('🔟 Deve sugerir horários alternativos', async () => {
    const response = await request(app.getHttpServer())
      .get(`/agendamentos/sugerir/${clinicId}`)
      .query({
        data: '2025-12-26', // Dia após Natal
        duracao: 60,
      })
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    
    // Horários devem estar fora do almoço
    const horariosAlmoco = response.body.filter((h: string) => {
      const [hora] = h.split(':');
      return parseInt(hora) >= 12 && parseInt(hora) < 14;
    });
    expect(horariosAlmoco.length).toBe(0);
  });
});
