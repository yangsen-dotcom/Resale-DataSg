import { useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { SINGAPORE_CENTER, TOWN_COORDINATES } from '../../data/townCoordinates'
import type { TownAveragePriceResponse } from '../../api/types'
import { buildPriceColorScale, PRICE_COLOR_STEPS } from './priceColorScale'
import styles from './TownMap.module.css'
import '../../styles/chart-tokens.css'

const CURRENCY_COMPACT = new Intl.NumberFormat('en-SG', {
  style: 'currency',
  currency: 'SGD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

function createMarkerIcon(color: string, selected: boolean): L.DivIcon {
  const border = selected ? '3px solid var(--text-primary, #0b0b0b)' : '2px solid var(--chart-surface, #fcfcfb)'
  return L.divIcon({
    className: styles.markerWrapper,
    html: `<span class="${styles.markerDot}" style="background:${color};border:${border}"></span>`,
    iconSize: [selected ? 22 : 16, selected ? 22 : 16],
  })
}

interface TownMapProps {
  towns: string[]
  townStats: TownAveragePriceResponse[]
  selectedTown?: string
  onSelectTown: (town: string) => void
}

export function TownMap({ towns, townStats, selectedTown, onSelectTown }: TownMapProps) {
  const { colorForTown, minPrice, maxPrice } = useMemo(() => buildPriceColorScale(townStats), [townStats])

  const markers = towns
    .map((town) => ({ town, coords: TOWN_COORDINATES[town] }))
    .filter((entry): entry is { town: string; coords: [number, number] } => Boolean(entry.coords))

  return (
    <div className={`${styles.wrapper} vizRoot`}>
      <MapContainer center={SINGAPORE_CENTER} zoom={11} scrollWheelZoom className={styles.map}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map(({ town, coords }) => (
          <Marker
            key={town}
            position={coords}
            icon={createMarkerIcon(colorForTown(town), town === selectedTown)}
            eventHandlers={{ click: () => onSelectTown(town) }}
          >
            <Popup>
              <strong>{town}</strong>
              <br />
              Avg price: {CURRENCY_COMPACT.format(priceForTown(townStats, town))}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {minPrice !== undefined && maxPrice !== undefined && (
        <div className={styles.legend}>
          <span>{CURRENCY_COMPACT.format(minPrice)}</span>
          <div className={styles.legendGradient}>
            {PRICE_COLOR_STEPS.map((color) => (
              <span key={color} className={styles.legendSwatch} style={{ background: color }} />
            ))}
          </div>
          <span>{CURRENCY_COMPACT.format(maxPrice)}</span>
          <span className={styles.legendLabel}>Average resale price</span>
        </div>
      )}
    </div>
  )
}

function priceForTown(townStats: TownAveragePriceResponse[], town: string): number {
  return townStats.find((t) => t.town === town)?.averagePrice ?? 0
}
