import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test/testUtils'
import { InsightsPage } from './InsightsPage'

describe('InsightsPage', () => {
  it('lists every town in the sidebar, all visible by default', async () => {
    renderWithProviders(<InsightsPage />)

    const bedok = await screen.findByRole('button', { name: 'BEDOK' })
    expect(bedok).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'ANG MO KIO' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'TAMPINES' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('renders the comparison chart once data loads', async () => {
    renderWithProviders(<InsightsPage />)

    await waitFor(() =>
      expect(screen.getByRole('img', { name: /average resale price comparison between towns/i })).toBeInTheDocument(),
    )
  })

  it('toggles a town off and back on when clicked in the sidebar', async () => {
    renderWithProviders(<InsightsPage />)

    const bedok = await screen.findByRole('button', { name: 'BEDOK' })
    await userEvent.click(bedok)
    expect(bedok).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(bedok)
    expect(bedok).toHaveAttribute('aria-pressed', 'true')
  })

  it('hides all towns when "None" is clicked, and restores them with "All"', async () => {
    renderWithProviders(<InsightsPage />)

    const bedok = await screen.findByRole('button', { name: 'BEDOK' })
    await userEvent.click(screen.getByRole('button', { name: 'None' }))
    expect(bedok).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(screen.getByRole('button', { name: 'All' }))
    expect(bedok).toHaveAttribute('aria-pressed', 'true')
  })

  it('switches to the Flat Types comparison when that nav item is clicked', async () => {
    renderWithProviders(<InsightsPage />)

    await screen.findByRole('button', { name: 'BEDOK' })
    await userEvent.click(screen.getByRole('button', { name: 'Flat Types' }))

    const fourRoom = await screen.findByRole('button', { name: '4 ROOM' })
    expect(fourRoom).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByRole('button', { name: 'BEDOK' })).not.toBeInTheDocument()
    await waitFor(() =>
      expect(
        screen.getByRole('img', { name: /average resale price comparison between flat types/i }),
      ).toBeInTheDocument(),
    )
  })

  it('switches to the Remain Lease chart when that nav item is clicked', async () => {
    renderWithProviders(<InsightsPage />)

    await screen.findByRole('button', { name: 'BEDOK' })
    await userEvent.click(screen.getByRole('button', { name: 'Remain Lease' }))

    await waitFor(() =>
      expect(
        screen.getByRole('img', { name: /average resale price by remaining lease years/i }),
      ).toBeInTheDocument(),
    )
    expect(screen.queryByRole('button', { name: 'BEDOK' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'All' })).not.toBeInTheDocument()
  })

  it('switches the Towns chart to the highest price view via the metric toggle', async () => {
    renderWithProviders(<InsightsPage />)

    await screen.findByRole('button', { name: 'BEDOK' })
    await waitFor(() =>
      expect(screen.getByRole('img', { name: /average resale price comparison between towns/i })).toBeInTheDocument(),
    )

    await userEvent.click(screen.getByRole('button', { name: 'Highest Price' }))

    await waitFor(() =>
      expect(screen.getByRole('img', { name: /highest resale price comparison between towns/i })).toBeInTheDocument(),
    )
    expect(screen.getByRole('button', { name: 'Highest Price' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'BEDOK' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('switches the Towns chart to the lowest price view via the metric toggle', async () => {
    renderWithProviders(<InsightsPage />)

    await screen.findByRole('button', { name: 'BEDOK' })
    await userEvent.click(screen.getByRole('button', { name: 'Lowest Price' }))

    await waitFor(() =>
      expect(screen.getByRole('img', { name: /lowest resale price comparison between towns/i })).toBeInTheDocument(),
    )
    expect(screen.getByRole('button', { name: 'Lowest Price' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'BEDOK' })).toHaveAttribute('aria-pressed', 'true')
  })
})
