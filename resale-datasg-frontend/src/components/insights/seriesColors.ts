// Generates one distinct color per series key (town or flat type), in a fixed
// (alphabetical) order so a given key always gets the same color across
// renders. With ~26 towns this necessarily goes past the validated 8-slot
// categorical palette used elsewhere in the app - color alone won't reliably
// distinguish all of them. The legend (a real legend with click-to-toggle) is
// what actually makes this usable, not the color assignment by itself.
export function buildColorScale(keys: string[]): Map<string, string> {
  const sorted = [...keys].sort((a, b) => a.localeCompare(b))
  const colors = new Map<string, string>()
  sorted.forEach((key, index) => {
    const hue = Math.round((index / Math.max(sorted.length, 1)) * 360)
    colors.set(key, `hsl(${hue}, 65%, 48%)`)
  })
  return colors
}
