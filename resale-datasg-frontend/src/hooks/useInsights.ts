import { useQuery } from '@tanstack/react-query'
import {
  getAveragePriceByRemainingLease,
  getByTown,
  getMaxPriceTrendByTown,
  getMinPriceTrendByTown,
  getPriceTrendByFlatType,
  getPriceTrendByTown,
  type InsightsFilterParams,
} from '../api/insights'

export function usePriceTrendByTown(groupBy: 'month' | 'year', enabled = true) {
  return useQuery({
    queryKey: ['insights', 'price-trend-by-town', groupBy],
    queryFn: () => getPriceTrendByTown(groupBy),
    staleTime: 10 * 60 * 1000,
    enabled,
  })
}

export function usePriceTrendByFlatType(groupBy: 'month' | 'year', enabled = true) {
  return useQuery({
    queryKey: ['insights', 'price-trend-by-flat-type', groupBy],
    queryFn: () => getPriceTrendByFlatType(groupBy),
    staleTime: 10 * 60 * 1000,
    enabled,
  })
}

export function useMaxPriceTrendByTown(groupBy: 'month' | 'year', enabled = true) {
  return useQuery({
    queryKey: ['insights', 'max-price-trend-by-town', groupBy],
    queryFn: () => getMaxPriceTrendByTown(groupBy),
    staleTime: 10 * 60 * 1000,
    enabled,
  })
}

export function useMinPriceTrendByTown(groupBy: 'month' | 'year', enabled = true) {
  return useQuery({
    queryKey: ['insights', 'min-price-trend-by-town', groupBy],
    queryFn: () => getMinPriceTrendByTown(groupBy),
    staleTime: 10 * 60 * 1000,
    enabled,
  })
}

export function useAveragePriceByRemainingLease(enabled = true) {
  return useQuery({
    queryKey: ['insights', 'average-price-by-remaining-lease'],
    queryFn: getAveragePriceByRemainingLease,
    staleTime: 10 * 60 * 1000,
    enabled,
  })
}

export function useByTown(params: Pick<InsightsFilterParams, 'flatType' | 'fromMonth' | 'toMonth'>) {
  return useQuery({
    queryKey: ['insights', 'by-town', params],
    queryFn: () => getByTown(params),
  })
}
