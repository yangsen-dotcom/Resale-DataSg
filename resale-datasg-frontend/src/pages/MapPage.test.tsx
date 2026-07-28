import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test/testUtils'
import { MapPage } from './MapPage'

// Leaflet depends on DOM measurement APIs jsdom doesn't implement well, so the
// real map isn't exercised here - MapPage's own drill-down logic is tested
// through the plain <select> fallback instead, which is real application logic
// and fully testable.
vi.mock('../components/map/TownMap', () => ({
  TownMap: () => <div data-testid="town-map-stub" />,
}))

describe('MapPage', () => {
  it('drills down from town to block to a transactions table', async () => {
    renderWithProviders(<MapPage />)

    const townSelect = await screen.findByLabelText('Town')
    await userEvent.selectOptions(townSelect, 'BEDOK')

    const blockSelect = await screen.findByLabelText('Block')
    await userEvent.selectOptions(blockSelect, '123')

    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument())
    expect(screen.getByText('BEDOK NORTH RD')).toBeInTheDocument()
  })

  it('does not show a block selector before a town is chosen', async () => {
    renderWithProviders(<MapPage />)

    await screen.findByLabelText('Town')
    expect(screen.queryByLabelText('Block')).not.toBeInTheDocument()
  })
})
