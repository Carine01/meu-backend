import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';

/**
 * Teste E2E CRÍTICO: Fluxo Completo de Indicações Gamificado
 * Tempo estimado: 45min
 */
describe('[CRITICO] Fluxo de Indicação Completo (e2e)', () => {
  let app: INestApplication;
  let leadIndicadorId: string;
  let indicacaoId: string;

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

  it('1️⃣ Deve criar lead indicador', async () => {
    const response = await request(app.getHttpServer())
      .post('/leads')
      .send({
        nome: 'João Indicador',
        telefone: '+5511999999991',
        email: 'joao@teste.com',
      })
      .expect(201);

    leadIndicadorId = response.body.id;
    expect(leadIndicadorId).toBeDefined();
    expect(response.body.nome).toBe('João Indicador');
  });

  it('2️⃣ Deve enviar primeira indicação (+1 ponto)', async () => {
    const response = await request(app.getHttpServer())
      .post('/indicacoes')
      .send({
        indicadorId: leadIndicadorId,
        nome: 'Maria Indicada 1',
        telefone: '+5511999999992',
        email: 'maria1@teste.com',
      })
      .expect(201);

    indicacaoId = response.body.indicacao.id;
    expect(response.body.indicacao.status).toBe('pendente');
    expect(response.body.indicacao.pontosGanhos).toBe(1);
    expect(response.body.recompensa.pontosAcumulados).toBe(1);
    expect(response.body.recompensa.sessoesGratisDisponiveis).toBe(0);
  });

  it('3️⃣ Deve enviar segunda indicação (+1 ponto)', async () => {
    const response = await request(app.getHttpServer())
      .post('/indicacoes')
      .send({
        indicadorId: leadIndicadorId,
        nome: 'Pedro Indicado 2',
        telefone: '+5511999999993',
      })
      .expect(201);

    expect(response.body.recompensa.pontosAcumulados).toBe(2);
  });

  it('4️⃣ Deve enviar terceira indicação e ganhar sessão grátis', async () => {
    const response = await request(app.getHttpServer())
      .post('/indicacoes')
      .send({
        indicadorId: leadIndicadorId,
        nome: 'Ana Indicada 3',
        telefone: '+5511999999994',
      })
      .expect(201);

    expect(response.body.recompensa.pontosAcumulados).toBe(3);
    expect(response.body.recompensa.sessoesGratisDisponiveis).toBe(1);
  });

  it('5️⃣ Indicado agenda consulta (+0 pontos bônus pois ainda não compareceu)', async () => {
    const response = await request(app.getHttpServer())
      .put(`/indicacoes/agendou/${indicacaoId}`)
      .send({
        agendamentoId: 'AGD123456',
      })
      .expect(200);

    expect(response.body.status).toBe('agendado');
  });

  it('6️⃣ Indicado comparece na consulta (+2 pontos bônus)', async () => {
    const response = await request(app.getHttpServer())
      .put(`/indicacoes/compareceu/${indicacaoId}`)
      .expect(200);

    expect(response.body.status).toBe('compareceu');
    expect(response.body.pontosGanhos).toBe(3); // 1 inicial + 2 bônus
  });

  it('7️⃣ Deve verificar recompensa atualizada (5 pontos = 1 sessão grátis)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/indicacoes/recompensa/${leadIndicadorId}`)
      .expect(200);

    expect(response.body.pontosAcumulados).toBe(5); // 3 indicações + 2 bônus
    expect(response.body.sessoesGratisDisponiveis).toBe(1);
  });

  it('8️⃣ Deve resgatar sessão grátis', async () => {
    const response = await request(app.getHttpServer())
      .post(`/indicacoes/resgatar/${leadIndicadorId}`)
      .expect(201);

    expect(response.body.sucesso).toBe(true);
    expect(response.body.sessoesGratisRestantes).toBe(0);
    expect(response.body.pontosAcumulados).toBe(5); // Pontos não resetam
  });

  it('9️⃣ Não deve resgatar sessão inexistente', async () => {
    await request(app.getHttpServer())
      .post(`/indicacoes/resgatar/${leadIndicadorId}`)
      .expect(400);
  });

  it('🔟 Deve listar histórico de indicações', async () => {
    const response = await request(app.getHttpServer())
      .get(`/indicacoes/${leadIndicadorId}`)
      .expect(200);

    expect(response.body.length).toBe(3);
    expect(response.body[0].status).toBe('compareceu');
  });
});
