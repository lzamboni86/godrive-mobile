// Serviço para consumir a API da Tabela FIPE
export interface FipeMarca {
  nome: string;
  codigo: string;
}

export interface FipeModelo {
  nome: string;
  codigo: string;
}

export interface FipeAno {
  nome: string;
  codigo: string;
  valor: string;
}

const FIPE_BASE_URL = 'https://parallelum.com.br/fipe/api/v1/carros';

// Cache para evitar requisições repetidas
let marcasCache: FipeMarca[] | null = null;
let marcasPromise: Promise<FipeMarca[]> | null = null;

const modelosCacheByMarca: Record<string, FipeModelo[]> = {};
const modelosPromiseByMarca: Partial<Record<string, Promise<FipeModelo[]>>> = {};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`FIPE API request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function getFipeMarcas(): Promise<FipeMarca[]> {
  if (marcasCache) return marcasCache;
  if (marcasPromise) return marcasPromise;

  marcasPromise = (async () => {
    try {
      const data = await fetchJson<FipeMarca[]>(`${FIPE_BASE_URL}/marcas`);
      const normalized = (data || []).filter(Boolean);
      marcasCache = normalized;
      marcasPromise = null;
      return normalized;
    } catch (error) {
      marcasPromise = null;
      throw error;
    }
  })();

  return marcasPromise;
}

// Fallback de modelos populares por marca
const FALLBACK_MODELLOS: Record<string, string[]> = {
  'volkswagen': [
    'Gol', 'Polo', 'Fox', 'Up', 'T-Cross', 'Nivus', 'Virtus', 'Polo Track',
    'Saveiro', 'Jetta', 'Tiguan', 'Passat', 'Voyage', 'Santana', 'Golf'
  ],
  'chevrolet': [
    'Onix', 'Prisma', 'Spin', 'Tracker', 'Cobalt', 'S10', 'Cruze', 'Corsa',
    'Agile', 'Montana', 'Omega', 'Vectra', 'Astra', 'Celta', 'Blazer'
  ],
  'fiat': [
    'Palio', 'Siena', 'Uno', 'Strada', 'Toro', 'Mobi', 'Argo', 'Cronos',
    'Doblo', 'Fiorino', 'Punto', 'Idea', 'Stilo', 'Linea', '500', 'Tributo'
  ],
  'toyota': [
    'Corolla', 'Hilux', 'Etios', 'Yaris', 'SW4', 'Prius', 'Camry', 'RAV4',
    'Fortuner', 'Hiace', 'Bandeiante', 'Fielder', 'Prius C', 'Verso'
  ],
  'honda': [
    'Civic', 'Fit', 'City', 'HR-V', 'WR-V', 'CR-V', 'Accord', 'Pilot',
    'Odyssey', 'Ridgeline', 'Insight', 'Clarity', 'S2000', 'NSX'
  ],
  'ford': [
    'Ka', 'Fiesta', 'EcoSport', 'Focus', 'Fusion', 'Ranger', 'Mustang',
    'Edge', 'Explorer', 'Territory', 'Taurus', 'F-250', 'F-1000', 'Courier'
  ],
  'renault': [
    'Kwid', 'Sandero', 'Logan', 'Duster', 'Captur', 'Oroch', 'Fluence',
    'Clio', 'Symbol', 'Master', 'Kangoo', 'Alaskan', 'Megane', 'Talisman'
  ],
  'hyundai': [
    'HB20', 'Creta', 'i30', 'ix35', 'Santa Fé', 'Tucson', 'Azera', 'Elantra',
    'Sonata', 'Veloster', 'Genesis', 'Equus', 'H1', 'H100', 'Starex'
  ],
  'nissan': [
    'Kicks', 'March', 'Sentra', 'Versa', 'Frontier', 'XTerra', 'Pathfinder',
    'Murano', 'Rogue', 'Altima', 'Maxima', '370Z', 'GT-R', 'Leaf'
  ],
  'jeep': [
    'Renegade', 'Compass', 'Cherokee', 'Wrangler', 'Gladiator', 'Commander',
    'Patriot', 'Liberty', 'Grand Cherokee', 'Wrangler Unlimited'
  ]
};

export async function getFipeModelos(marcaCodigo: string): Promise<FipeModelo[]> {
  if (!marcaCodigo) return [];

  if (modelosCacheByMarca[marcaCodigo]) return modelosCacheByMarca[marcaCodigo];
  const existingPromise = modelosPromiseByMarca[marcaCodigo];
  if (existingPromise) return existingPromise;

  const promise = (async () => {
    try {
      console.log(`🔍 Buscando modelos para marca: ${marcaCodigo}`);
      const url = `${FIPE_BASE_URL}/marcas/${marcaCodigo}/modelos`;
      console.log(`📡 URL: ${url}`);
      
      const data = await fetchJson<any>(url);
      console.log(`📋 Dados brutos dos modelos:`, data);
      
      // A API FIPE retorna { modelos: [...] } ao invés de array direto
      let modelosArray: any[] = [];
      
      if (data && data.modelos && Array.isArray(data.modelos)) {
        modelosArray = data.modelos;
        console.log(`✅ Usando data.modelos:`, modelosArray);
      } else if (Array.isArray(data)) {
        modelosArray = data;
        console.log(`✅ Usando array direto:`, modelosArray);
      } else {
        console.warn(`⚠️ Formato de dados inesperado:`, typeof data, data);
        modelosArray = [];
      }
      
      const normalized = modelosArray
        .filter((item: any) => item && (item.nome || item.name))
        .map((item: any) => ({
          nome: item.nome || item.name || 'Modelo Sem Nome',
          codigo: item.codigo || item.code || item.codigo || String(item.id || Math.random())
        }));
      
      console.log(`✅ Modelos normalizados:`, normalized);
      
      // Se não encontrou modelos, tentar fallback
      if (normalized.length === 0) {
        console.log(`🔄 Tentando fallback para marca: ${marcaCodigo.toLowerCase()}`);
        const fallbackModels = FALLBACK_MODELLOS[marcaCodigo.toLowerCase()];
        if (fallbackModels && fallbackModels.length > 0) {
          const fallbackNormalized = fallbackModels.map(nome => ({
            nome,
            codigo: nome.toLowerCase().replace(/\s+/g, '-')
          }));
          console.log(`✅ Usando fallback:`, fallbackNormalized);
          modelosCacheByMarca[marcaCodigo] = fallbackNormalized;
          modelosPromiseByMarca[marcaCodigo] = undefined;
          return fallbackNormalized;
        }
      }
      
      modelosCacheByMarca[marcaCodigo] = normalized;
      modelosPromiseByMarca[marcaCodigo] = undefined;
      return normalized;
    } catch (error) {
      console.error(`❌ Erro ao buscar modelos da marca ${marcaCodigo}:`, error);
      
      // Tentar fallback em caso de erro
      console.log(`🔄 Tentando fallback após erro para marca: ${marcaCodigo.toLowerCase()}`);
      const fallbackModels = FALLBACK_MODELLOS[marcaCodigo.toLowerCase()];
      if (fallbackModels && fallbackModels.length > 0) {
        const fallbackNormalized = fallbackModels.map(nome => ({
          nome,
          codigo: nome.toLowerCase().replace(/\s+/g, '-')
        }));
        console.log(`✅ Usando fallback após erro:`, fallbackNormalized);
        modelosCacheByMarca[marcaCodigo] = fallbackNormalized;
        modelosPromiseByMarca[marcaCodigo] = undefined;
        return fallbackNormalized;
      }
      
      modelosPromiseByMarca[marcaCodigo] = undefined;
      throw error;
    }
  })();

  modelosPromiseByMarca[marcaCodigo] = promise;
  return promise;
}

export async function getFipeAnos(marcaCodigo: string, modeloCodigo: string): Promise<FipeAno[]> {
  if (!marcaCodigo || !modeloCodigo) return [];

  try {
    const data = await fetchJson<FipeAno[]>(`${FIPE_BASE_URL}/marcas/${marcaCodigo}/modelos/${modeloCodigo}/anos`);
    return (data || []).filter(Boolean);
  } catch (error) {
    console.error('Erro ao buscar anos:', error);
    return [];
  }
}
