import { fetchJson } from './client'
import type {
  FlatTypePriceTrendPointResponse,
  RemainingLeasePriceResponse,
  TownAveragePriceResponse,
  TownMaxPriceTrendPointResponse,
  TownMinPriceTrendPointResponse,
  TownPriceTrendPointResponse,
} from './types'

export interface InsightsFilterParams {
  town?: string
  flatType?: string
  fromMonth?: string
  toMonth?: string
}

export function getPriceTrendByTown(groupBy: 'month' | 'year'): Promise<TownPriceTrendPointResponse[]> {
  return fetchJson<TownPriceTrendPointResponse[]>('/api/insights/price-trend-by-town', { groupBy })
}

export function getPriceTrendByFlatType(groupBy: 'month' | 'year'): Promise<FlatTypePriceTrendPointResponse[]> {
  return fetchJson<FlatTypePriceTrendPointResponse[]>('/api/insights/price-trend-by-flat-type', { groupBy })
}

export function getMaxPriceTrendByTown(groupBy: 'month' | 'year'): Promise<TownMaxPriceTrendPointResponse[]> {
  return fetchJson<TownMaxPriceTrendPointResponse[]>('/api/insights/max-price-trend-by-town', { groupBy })
}

export function getMinPriceTrendByTown(groupBy: 'month' | 'year'): Promise<TownMinPriceTrendPointResponse[]> {
  return fetchJson<TownMinPriceTrendPointResponse[]>('/api/insights/min-price-trend-by-town', { groupBy })
}

export function getAveragePriceByRemainingLease(): Promise<RemainingLeasePriceResponse[]> {
  return fetchJson<RemainingLeasePriceResponse[]>('/api/insights/average-price-by-remaining-lease')
}

export function getByTown(
  params: Pick<InsightsFilterParams, 'flatType' | 'fromMonth' | 'toMonth'>,
): Promise<TownAveragePriceResponse[]> {
  return fetchJson<TownAveragePriceResponse[]>('/api/insights/by-town', params)
}
