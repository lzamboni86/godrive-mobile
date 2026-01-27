/**
 * Validação de CPF (algoritmo oficial brasileiro)
 * Aceita string com ou sem máscara; retorna boolean.
 */
export function isValidCpf(cpf: string): boolean {
  if (!cpf) return false;

  // Remove caracteres não numéricos
  const cleaned = cpf.replace(/\D/g, '');

  // CPF deve ter 11 dígitos
  if (cleaned.length !== 11) return false;

  // CPFs com todos os dígitos iguais são inválidos
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  // Cálculo dos dígitos verificadores
  let sum = 0;
  let remainder;

  // Valida o primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(9, 10))) return false;

  // Valida o segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(10, 11))) return false;

  return true;
}

/**
 * Formata CPF com máscara 000.000.000-00
 */
export function formatCpf(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Remove máscara do CPF (retorna apenas números)
 */
export function unmaskCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}
