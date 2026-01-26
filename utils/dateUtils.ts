/**
 * Utilitários para manipulação de datas sem problemas de timezone
 */

/**
 * Formata uma string de data YYYY-MM-DD para o formato brasileiro DD/MM
 * @param dateString - Data no formato YYYY-MM-DD
 * @returns Data formatada como DD/MM
 */
export const formatDateToBrazilian = (dateString: string): string => {
  if (!dateString) return '';
  
  // Divide a string e formata manualmente para evitar timezone issues
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}`;
};

/**
 * Formata uma string de data YYYY-MM-DD para o formato brasileiro completo DD/MM/YYYY
 * @param dateString - Data no formato YYYY-MM-DD
 * @returns Data formatada como DD/MM/YYYY
 */
export const formatDateToBrazilianFull = (dateString: string): string => {
  if (!dateString) return '';
  
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

/**
 * Formata uma string de data YYYY-MM-DD para exibição com nome do mês
 * @param dateString - Data no formato YYYY-MM-DD
 * @returns Data formatada como "DD de [Mês]"
 */
export const formatDateWithMonthName = (dateString: string): string => {
  if (!dateString) return '';
  
  const [year, month, day] = dateString.split('-').map(Number);
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  return `${day} de ${monthNames[month - 1]}`;
};

/**
 * Formata uma string de data YYYY-MM-DD para exibição com dia da semana
 * @param dateString - Data no formato YYYY-MM-DD
 * @returns Data formatada como "[Dia da semana], DD de [Mês]"
 */
export const formatDateWithWeekday = (dateString: string): string => {
  if (!dateString) return '';
  
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Criar data usando UTC para obter o dia da semana correto
  const date = new Date(Date.UTC(year, month - 1, day));
  
  const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const weekday = weekdays[date.getUTCDay()];
  const monthName = monthNames[month - 1];
  
  return `${weekday}, ${day} de ${monthName}`;
};

/**
 * Cria uma string de data YYYY-MM-DD a partir de um objeto Date
 * @param date - Objeto Date
 * @returns String no formato YYYY-MM-DD
 */
export const createDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Verifica se uma data é válida
 * @param dateString - Data no formato YYYY-MM-DD
 * @returns true se a data for válida
 */
export const isValidDateString = (dateString: string): boolean => {
  if (!dateString) return false;
  
  const parts = dateString.split('-');
  if (parts.length !== 3) return false;
  
  const [year, month, day] = parts.map(Number);
  
  // Verificar se os valores são numéricos e dentro dos limites
  if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // Verificar se a data é válida (ex: 31/02 não existe)
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

/**
 * Compara duas datas no formato YYYY-MM-DD
 * @param date1 - Primeira data
 * @param date2 - Segunda data
 * @returns -1 se date1 < date2, 0 se iguais, 1 se date1 > date2
 */
export const compareDates = (date1: string, date2: string): number => {
  if (date1 < date2) return -1;
  if (date1 > date2) return 1;
  return 0;
};

/**
 * Verifica se uma data é hoje
 * @param dateString - Data no formato YYYY-MM-DD
 * @returns true se for hoje
 */
export const isToday = (dateString: string): boolean => {
  const today = createDateString(new Date());
  return dateString === today;
};

/**
 * Verifica se uma data é passada
 * @param dateString - Data no formato YYYY-MM-DD
 * @returns true se for uma data passada
 */
export const isPastDate = (dateString: string): boolean => {
  const today = createDateString(new Date());
  return compareDates(dateString, today) < 0;
};
