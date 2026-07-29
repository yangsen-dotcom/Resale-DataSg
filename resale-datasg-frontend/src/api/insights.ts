import { fetchJson } from './client'
import type {
  AreaTrendPointResponse,
  FlatTypePriceTrendPointResponse,
  RemainingLeasePriceResponse,
  TownAveragePriceResponse,
  TownMaxPriceTrendPointResponse,
  TownMedianPriceTrendPointResponse,
  TownMinPriceTrendPointResponse,
  TownPricePerSqmTrendPointResponse,
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

export function getMedianPriceTrendByTown(groupBy: 'month' | 'year'): Promise<TownMedianPriceTrendPointResponse[]> {
  return fetchJson<TownMedianPriceTrendPointResponse[]>('/api/insights/median-price-trend-by-town', { groupBy })
}

export function getPricePerSqmTrendByTown(
  groupBy: 'month' | 'year',
): Promise<TownPricePerSqmTrendPointResponse[]> {
  return fetchJson<TownPricePerSqmTrendPointResponse[]>('/api/insights/price-per-sqm-trend-by-town', { groupBy })
}

export function getAreaTrend(groupBy: 'month' | 'year'): Promise<AreaTrendPointResponse[]> {
  return fetchJson<AreaTrendPointResponse[]>('/api/insights/area-trend', { groupBy })
}

export function getAveragePriceByRemainingLease(): Promise<RemainingLeasePriceResponse[]> {
  return fetchJson<RemainingLeasePriceResponse[]>('/api/insights/average-price-by-remaining-lease')
}

export function getByTown(
  params: Pick<InsightsFilterParams, 'flatType' | 'fromMonth' | 'toMonth'>,
): Promise<TownAveragePriceResponse[]> {
  return fetchJson<TownAveragePriceResponse[]>('/api/insights/by-town', params)
}
