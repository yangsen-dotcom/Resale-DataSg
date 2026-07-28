import styles from './ComparisonLegend.module.css'

interface ComparisonLegendProps {
  title: string
  keys: string[]
  visibleKeys: Set<string>
  colorForKey: (key: string) => string
  onToggleKey: (key: string) => void
  onShowAll: () => void
  onHideAll: () => void
}

export function ComparisonLegend({
  title,
  keys,
  visibleKeys,
  colorForKey,
  onToggleKey,
  onShowAll,
  onHideAll,
}: ComparisonLegendProps) {
  return (
    <div className={styles.legend}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <div className={styles.headerActions}>
          <button type="button" className={styles.actionButton} onClick={onShowAll}>
            All
          </button>
          <button type="button" className={styles.actionButton} onClick={onHideAll}>
            None
          </button>
        </div>
      </div>
      <div className={styles.chips}>
        {keys.map((key) => {
          const active = visibleKeys.has(key)
          const color = colorForKey(key)
          return (
            <button
              key={key}
              type="button"
              className={active ? styles.chipActive : styles.chip}
              style={active ? { borderColor: color, color } : undefined}
              aria-pressed={active}
              onClick={() => onToggleKey(key)}
            >
              <span
                className={styles.swatch}
                style={{ background: active ? color : 'transparent', borderColor: color }}
              />
              {key}
            </button>
          )
        })}
      </div>
    </div>
  )
}
