export type IbgeState = {
  id: number;
  sigla: string;
  nome: string;
};

export type IbgeCity = {
  id: number;
  nome: string;
};

const STATES_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome';

let statesCache: IbgeState[] | null = null;
let statesPromise: Promise<IbgeState[]> | null = null;

const citiesCacheByUf: Record<string, IbgeCity[]> = {};
const citiesPromiseByUf: Partial<Record<string, Promise<IbgeCity[]>>> = {};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`IBGE request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function getIbgeStates(): Promise<IbgeState[]> {
  if (statesCache) return statesCache;
  if (statesPromise) return statesPromise;

  statesPromise = (async () => {
    const data = await fetchJson<IbgeState[]>(STATES_URL);
    const normalized = (data || []).filter(Boolean);
    statesCache = normalized;
    statesPromise = null;
    return normalized;
  })().catch((e) => {
    statesPromise = null;
    throw e;
  });

  return statesPromise;
}

export async function getIbgeCitiesByUf(uf: string): Promise<IbgeCity[]> {
  const key = (uf || '').trim().toUpperCase();
  if (!key) return [];

  if (citiesCacheByUf[key]) return citiesCacheByUf[key];
  const existingPromise = citiesPromiseByUf[key];
  if (existingPromise) return existingPromise;

  const url = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${encodeURIComponent(key)}/municipios`;

  const promise = (async () => {
    const data = await fetchJson<IbgeCity[]>(url);
    const normalized = (data || []).filter(Boolean);
    citiesCacheByUf[key] = normalized;
    citiesPromiseByUf[key] = undefined;
    return normalized;
  })().catch((e) => {
    citiesPromiseByUf[key] = undefined;
    throw e;
  });

  citiesPromiseByUf[key] = promise;
  return promise;
}

// Bairros comuns por cidade (IBGE não fornece bairros)
const COMMON_NEIGHBORHOODS_BY_CITY: Record<string, string[]> = {
  'Curitiba': [
    'Água Verde', 'Batel', 'Bigorrilho', 'Boa Vista', 'Bacacheri', 'Barreirinha',
    'Boqueirão', 'Cajuru', 'Centro', 'Cidade Industrial', 'Fanny', 'Hauer',
    'Jardim Botânico', 'Jardim Social', 'Mercês', 'Pinheirinho', 'Portão',
    'Prado Velho', 'Rebouças', 'Santa Cândida', 'Santa Felicidade', 'Santo Inácio',
    'São Braz', 'São Francisco', 'São Lourenço', 'São Miguel', 'Tatuquara',
    'Umbará', 'Xaxim'
  ],
  'São Paulo': [
    'Bela Vista', 'Bom Retiro', 'Brás', 'Cambuci', 'Cantareira', 'Casa Verde',
    'Consolação', 'Freguesia do Ó', 'Ipiranga', 'Itaim Bibi', 'Jabaquara',
    'Lapa', 'Moema', 'Mooca', 'Paraíso', 'Perdizes', 'Pinheiros', 'Santana',
    'Santo Amaro', 'Sé', 'Vila Mariana', 'Vila Madalena', 'Vila Prudente'
  ],
  'Rio de Janeiro': [
    'Botafogo', 'Copacabana', 'Ipanema', 'Leblon', 'Flamengo', 'Tijuca',
    'Barra da Tijuca', 'Centro', 'Santa Teresa', 'Lapa', 'Laranjeiras',
    'Gávea', 'Jardim Botânico', 'São Cristóvão', 'Catete', 'Glória'
  ],
  'Brasília': [
    'Asa Norte', 'Asa Sul', 'Lago Norte', 'Lago Sul', 'Nordeste', 'Noroeste',
    'Oeste', 'Sudoeste', 'Centro', 'Cruzeiro', 'Guará', 'Taguatinga',
    'Ceilândia', 'Samambaia', 'Planaltina'
  ],
  'Belo Horizonte': [
    'Centro', 'Savassi', 'Funcionários', 'Lourdes', 'Santo Antônio', 'Barro Preto',
    'Santa Tereza', 'Floresta', 'Cidade Jardim', 'Sion', 'Prado', 'Buritis',
    'Pampulha', 'Santa Efigênia', 'Horto Florestal'
  ],
  'Porto Alegre': [
    'Centro', 'Cidade Baixa', 'Bom Fim', 'Moinhos de Vento', 'Partenon',
    'Auxiliadora', 'Petrópolis', 'Tristeza', 'Cristo Redentor', 'Menino Deus',
    'Azenha', 'Farroupilha', 'Jardim Carvalho', 'Santana', 'Humaitá'
  ],
  'Salvador': [
    'Centro', 'Barra', 'Rio Vermelho', 'Pituba', 'Itaigara', 'Graça',
    'Caminho das Árvores', 'Pituaçu', 'Imbuí', 'Stiep', 'Costa Azul',
    'Ondina', 'Garcia', 'Vitória', 'Barroquinha', 'Pelourinho'
  ],
  'Recife': [
    'Boa Viagem', 'Pina', 'Santo Amaro', 'São José', 'Centro', 'Madalena',
    'Graças', 'Casa Forte', 'Parnamirim', 'Torre', 'Jaqueira', 'Espinhheiro',
    'Aflitos', 'Poço', 'Encruzilhada', 'Derby', 'Olinda'
  ],
  'Fortaleza': [
    'Centro', 'Aldeota', 'Meireles', 'Papicu', 'Cocó', 'Barra do Ceará',
    'Mucuripe', 'Varjota', 'Dionísio Torres', 'Benfica', 'Parquelândia',
    'Joaquim Távora', 'Fátima', 'Montese', 'Parangaba', 'Pici'
  ],
  'Belém': [
    'Centro', 'Nazaré', 'Batista Campos', 'Umarizal', 'São Brás', 'Cidade Velha',
    'Cremação', 'Sacramenta', 'Pedreira', 'Condor', 'Marco', 'Val-de-Cães',
    'Tapanã', 'Guamá', 'Fátima', 'Curió-Utinga', 'Mangueirão'
  ],
  // Adicione mais cidades conforme necessário
};

export function getNeighborhoodsByCity(cityName: string): string[] {
  if (!cityName) return [];
  return COMMON_NEIGHBORHOODS_BY_CITY[cityName] || [];
}
