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
