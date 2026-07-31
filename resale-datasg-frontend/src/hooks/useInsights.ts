import { useQuery } from '@tanstack/react-query'
import {
  getAreaTrend,
  getAveragePriceByRemainingLease,
  getAveragePriceByStoreyRange,
  getAveragePriceByTownAndFlatType,
  getByTown,
  getMaxPriceTrendByTown,
  getMedianPriceTrendByTown,
  getMinPriceTrendByTown,
  getPricePerSqmTrendByTown,
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

export function useMedianPriceTrendByTown(groupBy: 'month' | 'year', enabled = true) {
  return useQuery({
    queryKey: ['insights', 'median-price-trend-by-town', groupBy],
    queryFn: () => getMedianPriceTrendByTown(groupBy),
    staleTime: 10 * 60 * 1000,
    enabled,
  })
}

export function usePricePerSqmTrendByTown(groupBy: 'month' | 'year', enabled = true) {
  return useQuery({
    queryKey: ['insights', 'price-per-sqm-trend-by-town', groupBy],
    queryFn: () => getPricePerSqmTrendByTown(groupBy),
    staleTime: 10 * 60 * 1000,
    enabled,
  })
}

export function useAreaTrend(groupBy: 'month' | 'year', enabled = true) {
  return useQuery({
    queryKey: ['insights', 'area-trend', groupBy],
    queryFn: () => getAreaTrend(groupBy),
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

export function useAveragePriceByStoreyRange(enabled = true) {
  return useQuery({
    queryKey: ['insights', 'average-price-by-storey-range'],
    queryFn: getAveragePriceByStoreyRange,
    staleTime: 10 * 60 * 1000,
    enabled,
  })
}

export function useAveragePriceByTownAndFlatType(enabled = true) {
  return useQuery({
    queryKey: ['insights', 'average-price-by-town-and-flat-type'],
    queryFn: getAveragePriceByTownAndFlatType,
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
