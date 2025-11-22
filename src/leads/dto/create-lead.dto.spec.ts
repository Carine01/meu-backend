import { CreateLeadDto, UpdateLeadDto } from './create-lead.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

describe('CreateLeadDto', () => {
  describe('validação de nome', () => {
    it('deve aceitar nome válido', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        nome: 'João Silva',
        phone: '11999999999',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('deve rejeitar nome muito curto', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        nome: 'Jo',
        phone: '11999999999',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('nome');
    });

    it('deve rejeitar nome muito longo', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        nome: 'a'.repeat(101),
        phone: '11999999999',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('deve remover espaços em branco do nome', () => {
      const dto = plainToInstance(CreateLeadDto, {
        nome: '  João Silva  ',
        phone: '11999999999',
      });
      expect(dto.nome).toBe('João Silva');
    });
  });

  describe('validação e transformação de telefone', () => {
    it('deve converter telefone para E.164', () => {
      const dto = plainToInstance(CreateLeadDto, {
        nome: 'João',
        phone: '11999999999',
      });
      expect(dto.phone).toBe('+5511999999999');
    });

    it('deve converter telefone formatado para E.164', () => {
      const dto = plainToInstance(CreateLeadDto, {
        nome: 'João',
        phone: '(11) 99999-9999',
      });
      expect(dto.phone).toBe('+5511999999999');
    });

    it('deve manter telefone já em E.164', () => {
      const dto = plainToInstance(CreateLeadDto, {
        nome: 'João',
        phone: '+5511999999999',
      });
      expect(dto.phone).toBe('+5511999999999');
    });

    it('deve rejeitar telefone inválido após transformação', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        nome: 'João',
        phone: '123', // Muito curto, não converte
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.property === 'phone')).toBe(true);
    });

    it('deve aceitar telefone fixo', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        nome: 'João',
        phone: '1133333333',
      });
      expect(dto.phone).toBe('+551133333333');
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('validação de email', () => {
    it('deve aceitar email válido', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        nome: 'João',
        phone: '11999999999',
        email: 'joao@test.com',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('deve converter email para minúsculas', () => {
      const dto = plainToInstance(CreateLeadDto, {
        nome: 'João',
        phone: '11999999999',
        email: 'JOAO@TEST.COM',
      });
      expect(dto.email).toBe('joao@test.com');
    });

    it('deve rejeitar email inválido', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        nome: 'João',
        phone: '11999999999',
        email: 'email-invalido',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.property === 'email')).toBe(true);
    });

    it('deve aceitar email ausente (campo opcional)', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        nome: 'João',
        phone: '11999999999',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('validação de origem', () => {
    it('deve aceitar origem válida', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        nome: 'João',
        phone: '11999999999',
        origem: 'form_site',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('deve remover espaços da origem', () => {
      const dto = plainToInstance(CreateLeadDto, {
        nome: 'João',
        phone: '11999999999',
        origem: '  form_site  ',
      });
      expect(dto.origem).toBe('form_site');
    });

    it('deve aceitar origem ausente (campo opcional)', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        nome: 'João',
        phone: '11999999999',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('validação de clinicId', () => {
    it('deve aceitar clinicId válido', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        nome: 'João',
        phone: '11999999999',
        clinicId: 'elevare-01',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('deve remover espaços do clinicId', () => {
      const dto = plainToInstance(CreateLeadDto, {
        nome: 'João',
        phone: '11999999999',
        clinicId: '  elevare-01  ',
      });
      expect(dto.clinicId).toBe('elevare-01');
    });
  });
});

describe('UpdateLeadDto', () => {
  it('deve aceitar atualização parcial', async () => {
    const dto = plainToInstance(UpdateLeadDto, {
      nome: 'João Atualizado',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve validar campos fornecidos', async () => {
    const dto = plainToInstance(UpdateLeadDto, {
      email: 'email-invalido',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('deve permitir atualização vazia', async () => {
    const dto = plainToInstance(UpdateLeadDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});

