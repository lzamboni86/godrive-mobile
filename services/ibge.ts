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

const neighborhoodsCacheByCity: Record<string, string[]> = {};
const neighborhoodsPromiseByCity: Partial<Record<string, Promise<string[]>>> = {};

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

export async function getNeighborhoodsByCityFromIBGE(cityName: string, stateUf: string): Promise<string[]> {
  if (!cityName || !stateUf) return [];

  const cacheKey = `${stateUf}-${cityName}`;
  if (neighborhoodsCacheByCity[cacheKey]) return neighborhoodsCacheByCity[cacheKey];
  const existingPromise = neighborhoodsPromiseByCity[cacheKey];
  if (existingPromise) return existingPromise;

  // Primeiro, encontrar o ID da cidade
  const cities = await getIbgeCitiesByUf(stateUf);
  const city = cities.find(c => c.nome.toLowerCase() === cityName.toLowerCase());
  
  console.log(`🔍 Buscando bairros para: ${cityName}/${stateUf}`);
  console.log(`🏙️ Cidade encontrada:`, city);
  
  if (!city) {
    console.log(`❌ Cidade ${cityName} não encontrada na API IBGE`);
    // Se não encontrar na API IBGE, retornar lista pré-cadastrada ou vazia
    const fallback = COMMON_NEIGHBORHOODS_BY_CITY[cityName] || [];
    neighborhoodsCacheByCity[cacheKey] = fallback;
    return fallback;
  }

  const promise = (async () => {
    try {
      // Buscar distritos/subdivisões da cidade (IBGE usa "distritos" para bairros)
      const url = `https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${city.id}/distritos`;
      console.log(`📡 Buscando URL: ${url}`);
      
      const data = await fetchJson<any[]>(url);
      console.log(`📋 Dados brutos recebidos:`, data);
      
      // Extrair nomes dos distritos
      const neighborhoods = (data || [])
        .map(district => {
          console.log(`🏘️ Processando distrito:`, district);
          return district.nome;
        })
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, 'pt-BR'));

      console.log(`✅ Bairros processados:`, neighborhoods);
      neighborhoodsCacheByCity[cacheKey] = neighborhoods;
      neighborhoodsPromiseByCity[cacheKey] = undefined;
      return neighborhoods;
    } catch (error) {
      console.warn(`Erro ao buscar bairros de ${cityName}:`, error);
      // Fallback para lista pré-cadastrada
      const fallback = COMMON_NEIGHBORHOODS_BY_CITY[cityName] || [];
      neighborhoodsCacheByCity[cacheKey] = fallback;
      neighborhoodsPromiseByCity[cacheKey] = undefined;
      return fallback;
    }
  })().catch((e) => {
    neighborhoodsPromiseByCity[cacheKey] = undefined;
    throw e;
  });

  neighborhoodsPromiseByCity[cacheKey] = promise;
  return promise;
}

// Bairros comuns por cidade (IBGE não fornece bairros diretamente)
const COMMON_NEIGHBORHOODS_BY_CITY: Record<string, string[]> = {
  'Curitiba': [
    'Água Verde', 'Batel', 'Bigorrilho', 'Boa Vista', 'Bacacheri', 'Barreirinha',
    'Boqueirão', 'Cajuru', 'Centro', 'Cidade Industrial', 'Fanny', 'Hauer',
    'Jardim Botânico', 'Jardim Social', 'Mercês', 'Pinheirinho', 'Portão',
    'Prado Velho', 'Rebouças', 'Santa Cândida', 'Santa Felicidade', 'Santo Inácio',
    'São Braz', 'São Francisco', 'São Lourenço', 'São Miguel', 'Tatuquara',
    'Umbará', 'Xaxim', 'Tarumã', 'Atuba', 'Abranches', 'Alto da Glória',
    'Alto da XV', 'Ahú', 'Barigui', 'Bela Vista', 'Campina do Barigui',
    'Cascavel', 'Cachoeira', 'Capanema', 'Capão da Imbuia', 'Capão Raso',
    'Cristo Rei', 'Ecoville', 'Fazendinha', 'Guaíra', 'Guabirotuba',
    'Hauer', 'Industrial', 'Jardim das Américas', 'Lamenha Pequena', 'Lindoia',
    'Maringá', 'Novo Mundo', 'Orleans', 'Parolin', 'Pilarzinho', 'Riviera',
    'Seminário', 'Sítio Cercado', 'Taboão', 'Tingui', 'Vista Alegre'
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
  'Joinville': [
    'Centro', 'Atiradores', 'Glória', 'Boa Vista', 'Saguaçu', 'Adhemar',
    'Bom Retiro', 'Costa e Silva', 'Fátima', 'Floresta', 'Guajarás', 'Itaoca',
    'Jardim Iracema', 'Jardim Petrópolis', 'Jardim Sofia', 'Paranaguamirim', 'Petrópolis',
    'Pirabeiraba', 'São Marcos', 'Vila Nova', 'Zona Norte', 'Zona Sul'
  ],
  'Florianópolis': [
    'Centro', 'Trindade', 'Saco dos Limões', 'Carvoeira', 'Córrego Grande', 'Estreito',
    'Itacorubi', 'João Paulo', 'Jurerê', 'Lagoa da Conceição', 'Pantanal', 'Ribeirão da Ilha',
    'Santo Antônio de Lisboa', 'São João do Rio Vermelho', 'Tapera'
  ],
  'Fazenda Rio Grande': [
    'Centro', 'Alto da Glória', 'Alto Mirim', 'Barra do Arapongas', 'Barro Preto', 'Boa Vista',
    'Cachoeira', 'Cachoeirinha', 'Cajuru', 'Campo do Sana', 'Capela Velha', 'Cará-Cará',
    'Cecília', 'Colégio', 'Contenda', 'Cristo Rei', 'Cristo Redentor', 'Cruzeiro',
    'Fazendinha', 'Guarani', 'Guarujá', 'Industrial', 'Jardim Alvorada', 'Jardim América',
    'Jardim das Nações', 'Jardim Europa', 'Jardim Glória', 'Jardim Iguaçu', 'Jardim Itália',
    'Jardim Margarida', 'Jardim Paulista', 'Jardim Primavera', 'Jardim São Carlos',
    'Jardim São João', 'Jardim São Marcos', 'Jardim São Paulo', 'Lagoa', 'Mato Alto',
    'Monte Castelo', 'Moradias Unidas', 'Nossa Senhora Aparecida', 'Nossa Senhora das Graças',
    'Novo Horizonte', 'Olaria', 'Padre Ulhoa', 'Palmital', 'Pinheirinho', 'Pioneiro',
    'Planalto', 'Porto Seguro', 'Progresso', 'Rio da Prata', 'Rio Verde', 'Rondon',
    'Santa Amélia', 'Santa Cecília', 'Santa Cruz', 'Santa Fé', 'Santa Helena', 'Santa Lúcia',
    'Santa Mônica', 'Santa Rita', 'Santa Rosa', 'Santa Tereza', 'Santa Terezinha', 'Santo Antônio',
    'São Domingos', 'São Francisco', 'São Geraldo', 'São Jorge', 'São José', 'São Judas Tadeu',
    'São Lourenço', 'São Lucas', 'São Marcos', 'São Miguel', 'São Pedro', 'São Roque',
    'São Vicente', 'Sítio Cercado', 'Taboão', 'Três Barras', 'Universitário', 'Vale do Sol',
    'Vila Aparecida', 'Vila Bela', 'Vila Boa Vista', 'Vila Carioca', 'Vila Esperança',
    'Vila Formosa', 'Vila Galvão', 'Vila Guaira', 'Vila Izabel', 'Vila Nova', 'Vila Paulista',
    'Vila Rio Branco', 'Vila Santa Maria', 'Vila São Bento', 'Vila São Jorge', 'Vila Torres'
  ],
  'Fazendo Rio Grande': [
    'Centro', 'Alto da Glória', 'Alto Mirim', 'Barra do Arapongas', 'Barro Preto', 'Boa Vista',
    'Cachoeira', 'Cachoeirinha', 'Cajuru', 'Campo do Sana', 'Capela Velha', 'Cará-Cará',
    'Cecília', 'Colégio', 'Contenda', 'Cristo Rei', 'Cristo Redentor', 'Cruzeiro',
    'Fazendinha', 'Guarani', 'Guarujá', 'Industrial', 'Jardim Alvorada', 'Jardim América',
    'Jardim das Nações', 'Jardim Europa', 'Jardim Glória', 'Jardim Iguaçu', 'Jardim Itália',
    'Jardim Margarida', 'Jardim Paulista', 'Jardim Primavera', 'Jardim São Carlos',
    'Jardim São João', 'Jardim São Marcos', 'Jardim São Paulo', 'Lagoa', 'Mato Alto',
    'Monte Castelo', 'Moradias Unidas', 'Nossa Senhora Aparecida', 'Nossa Senhora das Graças',
    'Novo Horizonte', 'Olaria', 'Padre Ulhoa', 'Palmital', 'Pinheirinho', 'Pioneiro',
    'Planalto', 'Porto Seguro', 'Progresso', 'Rio da Prata', 'Rio Verde', 'Rondon',
    'Santa Amélia', 'Santa Cecília', 'Santa Cruz', 'Santa Fé', 'Santa Helena', 'Santa Lúcia',
    'Santa Mônica', 'Santa Rita', 'Santa Rosa', 'Santa Tereza', 'Santa Terezinha', 'Santo Antônio',
    'São Domingos', 'São Francisco', 'São Geraldo', 'São Jorge', 'São José', 'São Judas Tadeu',
    'São Lourenço', 'São Lucas', 'São Marcos', 'São Miguel', 'São Pedro', 'São Roque',
    'São Vicente', 'Sítio Cercado', 'Taboão', 'Três Barras', 'Universitário', 'Vale do Sol',
    'Vila Aparecida', 'Vila Bela', 'Vila Boa Vista', 'Vila Carioca', 'Vila Esperança',
    'Vila Formosa', 'Vila Galvão', 'Vila Guaira', 'Vila Izabel', 'Vila Nova', 'Vila Paulista',
    'Vila Rio Branco', 'Vila Santa Maria', 'Vila São Bento', 'Vila São Jorge', 'Vila Torres'
  ],
  'Campinas': [
    'Centro', 'Barão Geraldo', 'Cambuí', 'Guaranes', 'Jardim Guanabara', 'Jardim Chapadão',
    'Nova América', 'Ponte Preta', 'Santa Odília', 'Santa Genebra', 'São Bernardo',
    'Swiss Park', 'Taquaral', 'Vila Industrial', 'Vila Teixeira', 'Vila Madalena'
  ],
  'Guarulhos': [
    'Centro', 'Bonsucesso', 'Cecap', 'Cumbica', 'Jardim São Paulo', 'Maciço',
    'Macedo', 'Ponte Grande', 'Presidente Dutra', 'São João', 'Taboão', 'Vila Galvão',
    'Vila Rosália', 'Vila Aurora', 'Vila Barros', 'Vila Meira'
  ],
  'Santo André': [
    'Centro', 'Capuava', 'Parque São Rafael', 'Parque Santa Maria', 'Jardim',
    'Santo André', 'Utinga', 'Vila Luzita', 'Vila Alzira', 'Vila Gilda', 'Vila Rio de Janeiro'
  ],
  'São Bernardo do Campo': [
    'Centro', 'Alvarenga', 'Baeta Neves', 'Bairro dos Montes', 'Cajamar', 'Cidade São Caetano',
    'Demarchi', 'Distrito Industrial', 'Jardim do Mar', 'Jardim Nova York', 'Jordanópolis',
    'Monte Verde', 'Pauliceia', 'Rudge Ramos', 'São Caetano', 'Vila Euclides', 'Vila Guaíra'
  ],
  'São José dos Campos': [
    'Centro', 'Bosque dos Eucaliptos', 'Campo dos Alemães', 'Eugênio de Melo', 'Jardim Aquarius',
    'Jardim Satélite', 'Jardim São Dimas', 'Parque Industrial', 'Parque Residencial São José',
    'Santana', 'São Francisco Xavier', 'Vila Ema', 'Vila Industrial', 'Vila Nova', 'Virgem dos Pobres'
  ],
  'Ribeirão Preto': [
    'Centro', 'Alto da Boa Vista', 'Bela Vista', 'Bosco', 'Campos Elíseos', 'Castelo',
    'Cidade Jardim', 'Jardim do Sol', 'Jardim Ipe', 'Jardim Paulista', 'Jardim Planalto',
    'Maurício', 'Monte Alegre', 'Nova Aliança', 'Pinheirinho', 'Ribeirinho', 'Sumarezinho'
  ],
  'Uberlândia': [
    'Centro', 'Alto Umuarama', 'Bom Jesus', 'Casa Branca', 'Daniel Fonseca', 'Lagoa',
    'Líder', 'Martins', 'Morada Nova', 'Nossa Senhora Aparecida', 'Patrícia', 'Santa Mônica',
    'São Jorge', 'Tibery', 'Tocantins', 'Umuarama', 'Vila Brasília'
  ],
  'Contagem': [
    'Centro', 'Alvorada', 'Barreiro', 'Cidade Industrial', 'Eldorado', 'Gutierrez',
    'Ipatinga', 'Jardim Alvorada', 'Jardim Atlântico', 'Nova Contagem', 'Novo Eldorado',
    'Palmácia', 'Planalto', 'Praia', 'São Geraldo', 'São José', 'Santo Antônio', 'Vila Rica'
  ],
  'Sorocaba': [
    'Centro', 'Alto da Boa Vista', 'Alto do Pinheiral', 'Bela Vista', 'Campolim', 'Cavadinha',
    'Éden', 'Jardim Batista', 'Jardim Éden', 'Jardim Maria', 'Jardim São Paulo', 'Laranjeiras',
    'Parque São Vicente', 'Pirajui', 'Santo Antônio', 'São Bento', 'Três Marias', 'Vila Áurea',
    'Vila Hortência', 'Vila Sabiá'
  ],
  'Niterói': [
    'Centro', 'Barreto', 'Cachoeiras', 'Camboinhas', 'Cantagalo', 'Charitas', 'Gragoatá',
    'Icaraí', 'Ingá', 'Itaipu', 'Jurujuba', 'Largo da Batalha', 'Maria Paula', 'Piratininga',
    'Ponta d Areia', 'Santa Rosa', 'São Domingos', 'São Francisco', 'São Lourenço', 'Tenente',
    'Várzea', 'Vila Progresso', 'Vital Brazil'
  ],
  // Adicione mais cidades conforme necessário
};

export function getNeighborhoodsByCity(cityName: string): string[] {
  if (!cityName) return [];
  return COMMON_NEIGHBORHOODS_BY_CITY[cityName] || [];
}

// Função principal que busca da API IBGE primeiro (para cobrir todo Brasil)
export async function getNeighborhoodsByCityDynamic(cityName: string, stateUf: string): Promise<string[]> {
  console.log(`🔍 Buscando bairros para: ${cityName}/${stateUf}`);
  
  // Tentar API IBGE primeiro (cobertura nacional)
  try {
    console.log(`📡 Buscando na API IBGE para ${cityName}/${stateUf}`);
    return await getNeighborhoodsByCityFromIBGE(cityName, stateUf);
  } catch (error) {
    console.warn(`❌ Falha na API IBGE para ${cityName}:`, error);
    
    // Fallback: lista pré-cadastrada (apenas para cidades principais)
    const preloaded = COMMON_NEIGHBORHOODS_BY_CITY[cityName];
    if (preloaded && preloaded.length > 0) {
      console.log(`✅ Usando lista pré-cadastrada para ${cityName}:`, preloaded);
      return preloaded;
    }
    
    // Último fallback: lista vazia
    console.log(`❌ Nenhum bairro encontrado para ${cityName}`);
    return [];
  }
}
