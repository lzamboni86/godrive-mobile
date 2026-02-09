export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export interface AddressData {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export type ViaCepErrorCode = 'NETWORK' | 'TIMEOUT' | 'SERVICE';

export class ViaCepError extends Error {
  code: ViaCepErrorCode;

  constructor(code: ViaCepErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'ViaCepError';
  }
}

/**
 * Consulta o endereço pelo CEP usando a API ViaCEP
 * @param cep CEP com ou sem formatação (aceita 00000-000 ou 00000000)
 * @returns Dados do endereço ou null se não encontrado
 */
export async function fetchAddressByCep(cep: string): Promise<AddressData | null> {
  // Remove caracteres não numéricos
  const cleanCep = cep.replace(/\D/g, '');
  
  if (cleanCep.length !== 8) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let response: Response;
    try {
      response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
        signal: controller.signal,
      });
    } catch (error: any) {
      const name = String(error?.name || '');
      const message = String(error?.message || '');
      if (name === 'AbortError' || controller.signal.aborted) {
        throw new ViaCepError('TIMEOUT', 'ViaCEP request timeout');
      }
      if (message.toLowerCase().includes('network request failed')) {
        throw new ViaCepError('NETWORK', 'ViaCEP network error');
      }
      throw new ViaCepError('SERVICE', 'ViaCEP request failed');
    } finally {
      clearTimeout(timeoutId);
    }
    
    if (!response.ok) {
      throw new ViaCepError('SERVICE', `ViaCEP HTTP ${response.status}`);
    }

    const data: ViaCepResponse = await response.json();

    if (data.erro) {
      return null;
    }

    return {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Valida se o CEP tem 8 dígitos
 */
export function isValidCepFormat(cep: string): boolean {
  const cleanCep = cep.replace(/\D/g, '');
  return cleanCep.length === 8;
}

/**
 * Formata o CEP no padrão 00000-000
 */
export function formatCep(cep: string): string {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length <= 5) {
    return cleanCep;
  }
  return `${cleanCep.slice(0, 5)}-${cleanCep.slice(5, 8)}`;
}
