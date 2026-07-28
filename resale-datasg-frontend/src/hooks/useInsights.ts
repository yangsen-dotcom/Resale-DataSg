import { useQuery } from '@tanstack/react-query'
import { getByFlatType, getByTown, getPriceTrend, getSummary, type InsightsFilterParams } from '../api/insights'

export function useSummary(params: Pick<InsightsFilterParams, 'town' | 'flatType'>) {
  return useQuery({
    queryKey: ['insights', 'summary', params],
    queryFn: () => getSummary(params),
  })
}

export function usePriceTrend(
  groupBy: 'month' | 'year',
  params: Pick<InsightsFilterParams, 'town' | 'flatType'>,
) {
  return useQuery({
    queryKey: ['insights', 'price-trend', groupBy, params],
    queryFn: () => getPriceTrend(groupBy, params),
  })
}

export function useByTown(params: Pick<InsightsFilterParams, 'flatType' | 'fromMonth' | 'toMonth'>) {
  return useQuery({
    queryKey: ['insights', 'by-town', params],
    queryFn: () => getByTown(params),
  })
}

export function useByFlatType(params: Pick<InsightsFilterParams, 'town' | 'fromMonth' | 'toMonth'>) {
  return useQuery({
    queryKey: ['insights', 'by-flat-type', params],
    queryFn: () => getByFlatType(params),
  })
}
