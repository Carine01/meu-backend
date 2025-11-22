import {
  toE164,
  isValidE164,
  formatPhoneDisplay,
  isCelular,
  extractDDD,
  isValidDDD,
} from './phone.util';

describe('Phone Utils', () => {
  describe('toE164', () => {
    it('deve converter celular sem código país', () => {
      expect(toE164('11999999999')).toBe('+5511999999999');
      expect(toE164('21987654321')).toBe('+5521987654321');
    });

    it('deve converter celular com formatação brasileira', () => {
      expect(toE164('(11) 99999-9999')).toBe('+5511999999999');
      expect(toE164('(21) 98765-4321')).toBe('+5521987654321');
    });

    it('deve converter telefone fixo', () => {
      expect(toE164('1133333333')).toBe('+551133333333');
      expect(toE164('(11) 3333-3333')).toBe('+551133333333');
    });

    it('deve manter número já em E.164', () => {
      expect(toE164('+5511999999999')).toBe('+5511999999999');
      expect(toE164('+551133333333')).toBe('+551133333333');
    });

    it('deve remover zero inicial', () => {
      expect(toE164('011999999999')).toBe('+5511999999999');
      expect(toE164('01133333333')).toBe('+551133333333');
    });

    it('deve retornar null para número inválido', () => {
      expect(toE164('123')).toBeNull();
      expect(toE164('99999')).toBeNull();
      expect(toE164('')).toBeNull();
      expect(toE164(null as any)).toBeNull();
      expect(toE164(undefined as any)).toBeNull();
    });

    it('deve aceitar números com espaços e caracteres especiais', () => {
      expect(toE164('11 99999-9999')).toBe('+5511999999999');
      expect(toE164('(11) 9.9999-9999')).toBe('+5511999999999');
      expect(toE164('+55 11 99999-9999')).toBe('+5511999999999');
    });

    it('deve rejeitar número com 55 mas tamanho inválido', () => {
      expect(toE164('5511999')).toBeNull(); // Muito curto
      expect(toE164('551199999999999')).toBeNull(); // Muito longo
    });
  });

  describe('isValidE164', () => {
    it('deve validar formato E.164 correto para celular', () => {
      expect(isValidE164('+5511999999999')).toBe(true);
      expect(isValidE164('+5521987654321')).toBe(true);
    });

    it('deve validar formato E.164 correto para fixo', () => {
      expect(isValidE164('+551133333333')).toBe(true);
      expect(isValidE164('+552133333333')).toBe(true);
    });

    it('deve rejeitar formato sem +', () => {
      expect(isValidE164('5511999999999')).toBe(false);
      expect(isValidE164('11999999999')).toBe(false);
    });

    it('deve rejeitar formato sem 55', () => {
      expect(isValidE164('+11999999999')).toBe(false);
    });

    it('deve rejeitar formato com tamanho inválido', () => {
      expect(isValidE164('+55119999')).toBe(false);
      expect(isValidE164('+551199999999999')).toBe(false);
    });

    it('deve rejeitar valores nulos ou vazios', () => {
      expect(isValidE164('')).toBe(false);
      expect(isValidE164(null as any)).toBe(false);
      expect(isValidE164(undefined as any)).toBe(false);
    });
  });

  describe('formatPhoneDisplay', () => {
    it('deve formatar celular para exibição', () => {
      expect(formatPhoneDisplay('+5511999999999')).toBe('(11) 99999-9999');
      expect(formatPhoneDisplay('11999999999')).toBe('(11) 99999-9999');
    });

    it('deve formatar fixo para exibição', () => {
      expect(formatPhoneDisplay('+551133333333')).toBe('(11) 3333-3333');
      expect(formatPhoneDisplay('1133333333')).toBe('(11) 3333-3333');
    });

    it('deve retornar original se inválido', () => {
      expect(formatPhoneDisplay('123')).toBe('123');
      expect(formatPhoneDisplay('abc')).toBe('abc');
      expect(formatPhoneDisplay('')).toBe('');
    });

    it('deve formatar números com formatação existente', () => {
      expect(formatPhoneDisplay('(11) 99999-9999')).toBe('(11) 99999-9999');
      expect(formatPhoneDisplay('(11) 3333-3333')).toBe('(11) 3333-3333');
    });
  });

  describe('isCelular', () => {
    it('deve identificar celular (11 dígitos)', () => {
      expect(isCelular('+5511999999999')).toBe(true);
      expect(isCelular('11999999999')).toBe(true);
      expect(isCelular('(11) 99999-9999')).toBe(true);
    });

    it('deve identificar fixo como não celular (10 dígitos)', () => {
      expect(isCelular('+551133333333')).toBe(false);
      expect(isCelular('1133333333')).toBe(false);
      expect(isCelular('(11) 3333-3333')).toBe(false);
    });

    it('deve retornar false para número inválido', () => {
      expect(isCelular('123')).toBe(false);
      expect(isCelular('')).toBe(false);
      expect(isCelular(null as any)).toBe(false);
    });
  });

  describe('extractDDD', () => {
    it('deve extrair DDD de celular', () => {
      expect(extractDDD('+5511999999999')).toBe('11');
      expect(extractDDD('21987654321')).toBe('21');
    });

    it('deve extrair DDD de fixo', () => {
      expect(extractDDD('+551133333333')).toBe('11');
      expect(extractDDD('(47) 3333-3333')).toBe('47');
    });

    it('deve retornar null para número inválido', () => {
      expect(extractDDD('123')).toBeNull();
      expect(extractDDD('')).toBeNull();
      expect(extractDDD(null as any)).toBeNull();
    });
  });

  describe('isValidDDD', () => {
    it('deve validar DDDs válidos', () => {
      expect(isValidDDD('11')).toBe(true); // São Paulo
      expect(isValidDDD('21')).toBe(true); // Rio de Janeiro
      expect(isValidDDD('47')).toBe(true); // Santa Catarina
      expect(isValidDDD('85')).toBe(true); // Ceará
      expect(isValidDDD('92')).toBe(true); // Amazonas
    });

    it('deve rejeitar DDDs inválidos', () => {
      expect(isValidDDD('00')).toBe(false);
      expect(isValidDDD('99')).toBe(false); // 99 não existe
      expect(isValidDDD('10')).toBe(false);
      expect(isValidDDD('1')).toBe(false); // Muito curto
      expect(isValidDDD('111')).toBe(false); // Muito longo
    });
  });
});

