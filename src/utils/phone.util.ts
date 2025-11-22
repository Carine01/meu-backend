/**
 * Utilitários para manipulação de números de telefone brasileiros
 */

/**
 * Converte telefone brasileiro para formato E.164 internacional
 * @param phone Telefone em qualquer formato: (11) 99999-9999, 11999999999, +5511999999999
 * @returns Telefone no formato +5511999999999 ou null se inválido
 * 
 * @example
 * toE164('11999999999') // '+5511999999999'
 * toE164('(11) 99999-9999') // '+5511999999999'
 * toE164('+5511999999999') // '+5511999999999'
 */
export function toE164(phone: string): string | null {
  if (!phone || typeof phone !== 'string') return null;

  // Remove todos os caracteres não numéricos
  let digits = phone.replace(/\D/g, '');

  // Remove zero inicial se houver (comum em números fixos antigos como 011...)
  if (digits.startsWith('0')) {
    digits = digits.substring(1);
  }

  // Se já tem código do país (55), valida tamanho
  if (digits.startsWith('55')) {
    // 12 dígitos: 55 + 10 (DDD + fixo)
    // 13 dígitos: 55 + 11 (DDD + celular com 9)
    if (digits.length === 12 || digits.length === 13) {
      return '+' + digits;
    }
    // Formato inválido mesmo com 55
    return null;
  }

  // Se tem 11 dígitos (DDD + 9 dígitos de celular), adiciona 55
  if (digits.length === 11) {
    return '+55' + digits;
  }

  // Se tem 10 dígitos (DDD + 8 dígitos de fixo), adiciona 55
  if (digits.length === 10) {
    return '+55' + digits;
  }

  // Formato inválido
  return null;
}

/**
 * Valida se telefone está no formato E.164
 * @param phone Telefone para validar
 * @returns true se está no formato +55XXXXXXXXXXX
 * 
 * @example
 * isValidE164('+5511999999999') // true
 * isValidE164('11999999999') // false
 */
export function isValidE164(phone: string): boolean {
  if (!phone) return false;
  // +55 seguido de 10 ou 11 dígitos
  return /^\+55\d{10,11}$/.test(phone);
}

/**
 * Formata telefone para exibição visual (formato brasileiro)
 * @param phone Telefone em qualquer formato
 * @returns Formato visual: (11) 99999-9999 ou (11) 3333-3333
 * 
 * @example
 * formatPhoneDisplay('+5511999999999') // '(11) 99999-9999'
 * formatPhoneDisplay('11999999999') // '(11) 99999-9999'
 * formatPhoneDisplay('+551133333333') // '(11) 3333-3333'
 */
export function formatPhoneDisplay(phone: string): string {
  const e164 = toE164(phone);
  if (!e164) return phone; // Retorna original se inválido

  // Remove +55 para trabalhar com dígitos
  const digits = e164.replace('+55', '');

  if (digits.length === 11) {
    // Celular: (11) 99999-9999
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
  } else if (digits.length === 10) {
    // Fixo: (11) 3333-3333
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`;
  }

  return phone; // Fallback
}

/**
 * Valida se telefone é celular (tem 9 dígitos após o DDD)
 * @param phone Telefone em qualquer formato
 * @returns true se for celular
 * 
 * @example
 * isCelular('+5511999999999') // true
 * isCelular('+551133333333') // false
 */
export function isCelular(phone: string): boolean {
  const e164 = toE164(phone);
  if (!e164) return false;
  
  const digits = e164.replace('+55', '');
  return digits.length === 11;
}

/**
 * Extrai DDD do telefone
 * @param phone Telefone em qualquer formato
 * @returns DDD (2 dígitos) ou null se inválido
 * 
 * @example
 * extractDDD('+5511999999999') // '11'
 * extractDDD('(21) 98888-8888') // '21'
 */
export function extractDDD(phone: string): string | null {
  const e164 = toE164(phone);
  if (!e164) return null;
  
  const digits = e164.replace('+55', '');
  return digits.substring(0, 2);
}

/**
 * Lista de DDDs válidos do Brasil por região
 */
export const DDD_VALIDOS = {
  SUDESTE: ['11', '12', '13', '14', '15', '16', '17', '18', '19', '21', '22', '24', '27', '28', '31', '32', '33', '34', '35', '37', '38'],
  SUL: ['41', '42', '43', '44', '45', '46', '47', '48', '49', '51', '53', '54', '55'],
  NORDESTE: ['71', '73', '74', '75', '77', '79', '81', '82', '83', '84', '85', '86', '87', '88', '89'],
  NORTE: ['61', '62', '63', '64', '65', '66', '67', '68', '69', '91', '92', '93', '94', '95', '96', '97', '98'],
};

/**
 * Valida se DDD é válido no Brasil
 */
export function isValidDDD(ddd: string): boolean {
  return Object.values(DDD_VALIDOS).flat().includes(ddd);
}

