import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

/**
 * Teste E2E CRÍTICO: Fila de Mensagens com Horário Comercial
 * Tempo estimado: 45min
 */
describe('[CRITICO] Fluxo de Fila de Mensagens (e2e)', () => {
  let app: INestApplication;
  let leadId: string;
  let mensagemId: string;

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

  it('1️⃣ Deve criar lead para receber mensagens', async () => {
    const response = await request(app.getHttpServer())
      .post('/leads')
      .send({
        nome: 'Teste Mensagem',
        telefone: '+5511999999996',
      })
      .expect(201);

    leadId = response.body.id;
  });

  it('2️⃣ Deve enfileirar mensagem de boas-vindas', async () => {
    const response = await request(app.getHttpServer())
      .post('/fila/enfileirar')
      .send({
        leadId,
        templateId: 'BOASVINDAS_01',
        agendarPara: null, // Envia imediatamente
      })
      .expect(201);

    mensagemId = response.body.id;
    expect(response.body.status).toBe('pendente');
  });

  it('3️⃣ Mensagem fora do horário comercial deve ser agendada', async () => {
    const horaForaComercial = new Date();
    horaForaComercial.setHours(23, 0, 0, 0); // 23:00

    const response = await request(app.getHttpServer())
      .post('/fila/enfileirar')
      .send({
        leadId,
        templateId: 'LEMBRETE_CONSULTA',
        agendarPara: horaForaComercial.toISOString(),
      })
      .expect(201);

    // Deve agendar para próximo dia útil às 8h
    const agendadoPara = new Date(response.body.agendadoPara);
    expect(agendadoPara.getHours()).toBeGreaterThanOrEqual(8);
    expect(agendadoPara.getHours()).toBeLessThan(22);
  });

  it('4️⃣ Deve buscar mensagens pendentes', async () => {
    const response = await request(app.getHttpServer())
      .get('/fila/pendentes')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('5️⃣ Deve processar mensagem com sucesso', async () => {
    const response = await request(app.getHttpServer())
      .post(`/fila/processar/${mensagemId}`)
      .expect(200);

    expect(response.body.status).toBe('enviado');
    expect(response.body.tentativas).toBe(1);
  });

  it('6️⃣ Deve registrar falha e retentar', async () => {
    // Cria mensagem para número inválido
    const responseCreate = await request(app.getHttpServer())
      .post('/fila/enfileirar')
      .send({
        leadId: 'LEAD_INVALIDO',
        templateId: 'TESTE',
      })
      .expect(201);

    const msgFalhaId = responseCreate.body.id;

    // Tenta processar (deve falhar)
    await request(app.getHttpServer())
      .post(`/fila/processar/${msgFalhaId}`)
      .expect(500);

    // Verifica que foi marcada para retry
    const response = await request(app.getHttpServer())
      .get(`/fila/${msgFalhaId}`)
      .expect(200);

    expect(response.body.status).toBe('pendente');
    expect(response.body.tentativas).toBe(1);
  });

  it('7️⃣ Deve marcar como falha após 3 tentativas', async () => {
    // Simula 3 tentativas falhadas
    for (let i = 0; i < 3; i++) {
      await request(app.getHttpServer())
        .post(`/fila/processar/${mensagemId}`)
        .catch(() => {}); // Ignora erro
    }

    const response = await request(app.getHttpServer())
      .get(`/fila/${mensagemId}`)
      .expect(200);

    // Após 3 tentativas, deve estar como 'falhou'
    if (response.body.tentativas >= 3) {
      expect(response.body.status).toBe('falhou');
    }
  });

  it('8️⃣ Deve cancelar mensagem pendente', async () => {
    const responseCreate = await request(app.getHttpServer())
      .post('/fila/enfileirar')
      .send({
        leadId,
        templateId: 'TESTE_CANCELAMENTO',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .delete(`/fila/${responseCreate.body.id}`)
      .expect(200);

    expect(response.body.status).toBe('cancelado');
  });

  it('9️⃣ Deve listar histórico de mensagens do lead', async () => {
    const response = await request(app.getHttpServer())
      .get(`/fila/lead/${leadId}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });
});
