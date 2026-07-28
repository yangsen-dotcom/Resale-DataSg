export const CURRENCY_COMPACT = new Intl.NumberFormat('en-SG', {
  style: 'currency',
  currency: 'SGD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export const NUMBER_COMPACT = new Intl.NumberFormat('en-SG', { notation: 'compact', maximumFractionDigits: 1 })

/** Rounds up to a "nice" number (1, 2, or 5 times a power of 10). */
function niceCeil(value: number): number {
  if (value <= 0) return 1
  const exponent = Math.floor(Math.log10(value))
  const magnitude = 10 ** exponent
  const fraction = value / magnitude
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10
  return niceFraction * magnitude
}

/** Generates `count` evenly spaced ticks from 0 to a nice rounded maximum. */
export function niceTicks(maxValue: number, count = 4): number[] {
  const niceMax = niceCeil(maxValue || 1)
  const step = niceMax / count
  return Array.from({ length: count + 1 }, (_, i) => Math.round(i * step))
}

function niceStep(rawStep: number): number {
  if (rawStep <= 0) return 1
  const exponent = Math.floor(Math.log10(rawStep))
  const magnitude = 10 ** exponent
  const fraction = rawStep / magnitude
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10
  return niceFraction * magnitude
}

/**
 * Generates "nice" evenly spaced ticks tightly bounding [min, max] — unlike
 * `niceTicks`, the axis doesn't have to start at 0, so it fits the actual
 * data range instead of wasting space below the smallest value.
 */
export function niceAxisTicks(min: number, max: number, count = 5): number[] {
  const safeMax = max <= min ? min + 1 : max
  const step = niceStep((safeMax - min) / count)
  const niceMin = Math.floor(min / step) * step
  const niceMax = Math.ceil(safeMax / step) * step
  const ticks: number[] = []
  for (let value = niceMin; value <= niceMax + step / 2; value += step) {
    ticks.push(Math.round(value))
  }
  return ticks
}

/** Evenly spaced ticks across a fixed [min, max], used exactly as given (no outward rounding). */
export function fixedRangeTicks(min: number, max: number, count = 7): number[] {
  const step = (max - min) / count
  return Array.from({ length: count + 1 }, (_, i) => Math.round(min + i * step))
}

/** Picks indices to label on a category axis so labels don't overlap. */
export function thinIndices(length: number, targetCount: number): number[] {
  if (length <= targetCount) {
    return Array.from({ length }, (_, i) => i)
  }
  const step = Math.ceil(length / targetCount)
  const indices: number[] = []
  for (let i = 0; i < length; i += step) {
    indices.push(i)
  }
  if (indices[indices.length - 1] !== length - 1) {
    indices.push(length - 1)
  }
  return indices
}
