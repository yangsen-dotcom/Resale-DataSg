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

  it('shows highest/lowest/average summary stats above the chart', async () => {
    renderWithProviders(<InsightsPage />)

    await screen.findByText('Highest')
    expect(screen.getByText('Lowest')).toBeInTheDocument()
    expect(screen.getByText('Average')).toBeInTheDocument()
    expect(screen.getByText(/TAMPINES · 2023/)).toBeInTheDocument()
    expect(screen.getByText(/ANG MO KIO · 2023/)).toBeInTheDocument()
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

  it('switches to the Storey Range chart when that nav item is clicked', async () => {
    renderWithProviders(<InsightsPage />)

    await screen.findByRole('button', { name: 'BEDOK' })
    await userEvent.click(screen.getByRole('button', { name: 'Storey Range' }))

    await waitFor(() =>
      expect(screen.getByRole('img', { name: /average resale price by storey range/i })).toBeInTheDocument(),
    )
    expect(screen.queryByRole('button', { name: 'BEDOK' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'All' })).not.toBeInTheDocument()
  })

  it('switches to the Town × Flat Type heatmap when that nav item is clicked', async () => {
    renderWithProviders(<InsightsPage />)

    await screen.findByRole('button', { name: 'BEDOK' })
    await userEvent.click(screen.getByRole('button', { name: 'Town × Flat Type' }))

    await waitFor(() =>
      expect(
        screen.getByRole('table', { name: /average resale price by town and flat type/i }),
      ).toBeInTheDocument(),
    )
    expect(screen.getByRole('columnheader', { name: '3 ROOM' })).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: 'BEDOK' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'All' })).not.toBeInTheDocument()
  })

  it('switches to the Wealth Index chart when that nav item is clicked, with a per-town legend', async () => {
    renderWithProviders(<InsightsPage />)

    await screen.findByRole('button', { name: 'BEDOK' })
    await userEvent.click(screen.getByRole('button', { name: 'Wealth Index' }))

    await waitFor(() =>
      expect(
        screen.getByRole('img', { name: /million-dollar resale transaction count comparison between towns/i }),
      ).toBeInTheDocument(),
    )
    const bedok = screen.getByRole('button', { name: 'BEDOK' })
    expect(bedok).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(bedok)
    expect(bedok).toHaveAttribute('aria-pressed', 'false')
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

  it('switches the Towns chart to the median price view via the metric toggle', async () => {
    renderWithProviders(<InsightsPage />)

    await screen.findByRole('button', { name: 'BEDOK' })
    await userEvent.click(screen.getByRole('button', { name: 'Median Price' }))

    await waitFor(() =>
      expect(screen.getByRole('img', { name: /median resale price comparison between towns/i })).toBeInTheDocument(),
    )
    expect(screen.getByRole('button', { name: 'Median Price' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'BEDOK' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('switches the Towns chart to the transaction count view via the metric toggle', async () => {
    renderWithProviders(<InsightsPage />)

    await screen.findByRole('button', { name: 'BEDOK' })
    await userEvent.click(screen.getByRole('button', { name: 'Transaction Count' }))

    await waitFor(() =>
      expect(
        screen.getByRole('img', { name: /number of transactions comparison between towns/i }),
      ).toBeInTheDocument(),
    )
    expect(screen.getByRole('button', { name: 'Transaction Count' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'BEDOK' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('switches the Flat Types chart to the transaction count view via the metric toggle', async () => {
    renderWithProviders(<InsightsPage />)

    await screen.findByRole('button', { name: 'BEDOK' })
    await userEvent.click(screen.getByRole('button', { name: 'Flat Types' }))
    await screen.findByRole('button', { name: '4 ROOM' })

    await userEvent.click(screen.getByRole('button', { name: 'Transaction Count' }))

    await waitFor(() =>
      expect(
        screen.getByRole('img', { name: /number of transactions comparison between flat types/i }),
      ).toBeInTheDocument(),
    )
    expect(screen.getByRole('button', { name: 'Transaction Count' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '4 ROOM' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByRole('button', { name: 'Highest Price' })).not.toBeInTheDocument()
  })

  it('switches to the Area chart when that nav item is clicked', async () => {
    renderWithProviders(<InsightsPage />)

    await screen.findByRole('button', { name: 'BEDOK' })
    await userEvent.click(screen.getByRole('button', { name: 'Area' }))

    await waitFor(() =>
      expect(screen.getByRole('img', { name: /median floor area by month/i })).toBeInTheDocument(),
    )
    expect(screen.queryByRole('button', { name: 'BEDOK' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'All' })).not.toBeInTheDocument()
  })

  it('switches the Towns chart to the price per SQM view via the metric toggle', async () => {
    renderWithProviders(<InsightsPage />)

    await screen.findByRole('button', { name: 'BEDOK' })
    await userEvent.click(screen.getByRole('button', { name: 'Price per SQM' }))

    await waitFor(() =>
      expect(
        screen.getByRole('img', { name: /average price per square metre comparison between towns/i }),
      ).toBeInTheDocument(),
    )
    expect(screen.getByRole('button', { name: 'Price per SQM' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'BEDOK' })).toHaveAttribute('aria-pressed', 'true')
  })
})
