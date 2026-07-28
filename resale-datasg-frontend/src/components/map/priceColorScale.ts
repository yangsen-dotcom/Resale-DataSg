import type { TownAveragePriceResponse } from '../../api/types'

// Sequential blue ramp (light -> dark), same palette family used throughout the
// app's charts (steps 250/350/450/550/650 from the validated sequential ramp).
export const PRICE_COLOR_STEPS = ['#86b6ef', '#5598e7', '#2a78d6', '#1c5cab', '#104281']

export function buildPriceColorScale(towns: TownAveragePriceResponse[]) {
  const sorted = [...towns].sort((a, b) => a.averagePrice - b.averagePrice)
  const rankByTown = new Map(sorted.map((t, index) => [t.town, index]))
  const total = sorted.length

  function colorForTown(town: string): string {
    const rank = rankByTown.get(town)
    if (rank === undefined || total === 0) {
      return PRICE_COLOR_STEPS[0]
    }
    const bucket = Math.min(PRICE_COLOR_STEPS.length - 1, Math.floor((rank / total) * PRICE_COLOR_STEPS.length))
    return PRICE_COLOR_STEPS[bucket]
  }

  return {
    colorForTown,
    minPrice: sorted[0]?.averagePrice,
    maxPrice: sorted[sorted.length - 1]?.averagePrice,
  }
}
