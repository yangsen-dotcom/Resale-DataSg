import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/testUtils'
import { InsightsPage } from './InsightsPage'

describe('InsightsPage', () => {
  it('renders summary stats loaded from the API', async () => {
    renderWithProviders(<InsightsPage />)

    await waitFor(() => expect(screen.getByText('Total transactions')).toBeInTheDocument())
    expect(screen.getByText('193.5K')).toBeInTheDocument()
  })

  it('renders the price trend chart once data loads', async () => {
    renderWithProviders(<InsightsPage />)

    await waitFor(() => expect(screen.getByRole('img', { name: /average resale price trend/i })).toBeInTheDocument())
  })
})
