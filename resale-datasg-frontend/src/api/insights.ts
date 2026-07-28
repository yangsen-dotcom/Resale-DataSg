import { fetchJson } from './client'
import type {
  FlatTypeAveragePriceResponse,
  PriceTrendPointResponse,
  SummaryStatsResponse,
  TownAveragePriceResponse,
} from './types'

export interface InsightsFilterParams {
  town?: string
  flatType?: string
  fromMonth?: string
  toMonth?: string
}

export function getSummary(params: Pick<InsightsFilterParams, 'town' | 'flatType'>): Promise<SummaryStatsResponse> {
  return fetchJson<SummaryStatsResponse>('/api/insights/summary', params)
}

export function getPriceTrend(
  groupBy: 'month' | 'year',
  params: Pick<InsightsFilterParams, 'town' | 'flatType'>,
): Promise<PriceTrendPointResponse[]> {
  return fetchJson<PriceTrendPointResponse[]>('/api/insights/price-trend', { groupBy, ...params })
}

export function getByTown(
  params: Pick<InsightsFilterParams, 'flatType' | 'fromMonth' | 'toMonth'>,
): Promise<TownAveragePriceResponse[]> {
  return fetchJson<TownAveragePriceResponse[]>('/api/insights/by-town', params)
}

export function getByFlatType(
  params: Pick<InsightsFilterParams, 'town' | 'fromMonth' | 'toMonth'>,
): Promise<FlatTypeAveragePriceResponse[]> {
  return fetchJson<FlatTypeAveragePriceResponse[]>('/api/insights/by-flat-type', params)
}
