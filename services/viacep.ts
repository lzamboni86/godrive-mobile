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
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    
    if (!response.ok) {
      console.error('ViaCEP: Erro na requisição', response.status);
      return null;
    }

    const data: ViaCepResponse = await response.json();

    if (data.erro) {
      console.log('ViaCEP: CEP não encontrado', cleanCep);
      return null;
    }

    return {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
    };
  } catch (error) {
    console.error('ViaCEP: Erro ao buscar CEP', error);
    return null;
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
