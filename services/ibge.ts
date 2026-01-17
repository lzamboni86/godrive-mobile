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
