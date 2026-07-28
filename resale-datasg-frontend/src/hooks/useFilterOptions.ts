import { useQuery } from '@tanstack/react-query'
import { getBlocks, getFlatTypes, getTowns } from '../api/transactions'

const STALE_TIME_MS = 10 * 60 * 1000

export function useTowns() {
  return useQuery({
    queryKey: ['towns'],
    queryFn: getTowns,
    staleTime: STALE_TIME_MS,
  })
}

export function useFlatTypes() {
  return useQuery({
    queryKey: ['flatTypes'],
    queryFn: getFlatTypes,
    staleTime: STALE_TIME_MS,
  })
}

export function useBlocks(town: string | undefined) {
  return useQuery({
    queryKey: ['blocks', town],
    queryFn: () => getBlocks(town as string),
    enabled: !!town,
    staleTime: STALE_TIME_MS,
  })
}
