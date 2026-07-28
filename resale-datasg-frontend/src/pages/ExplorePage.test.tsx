import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { renderWithProviders } from '../test/testUtils'
import { server } from '../test/mocks/server'
import { ExplorePage } from './ExplorePage'

describe('ExplorePage', () => {
  it('loads and displays transactions from the API', async () => {
    renderWithProviders(<ExplorePage />)

    expect(screen.getByText(/loading transactions/i)).toBeInTheDocument()

    const table = await screen.findByRole('table')
    await waitFor(() => expect(within(table).getByText('BEDOK')).toBeInTheDocument())
    expect(screen.getByText('1–1 of 1 results')).toBeInTheDocument()
  })

  it('shows filter options loaded from the API', async () => {
    renderWithProviders(<ExplorePage />)

    await waitFor(() => expect(screen.getByLabelText('BEDOK')).toBeInTheDocument())
    expect(screen.getByLabelText('4 ROOM')).toBeInTheDocument()
  })

  it('shows an error state when the API request fails', async () => {
    server.use(
      http.get('http://localhost:9090/api/transactions', () => new HttpResponse(null, { status: 500 })),
    )
    renderWithProviders(<ExplorePage />)

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.getByText(/failed to load transactions/i)).toBeInTheDocument()
  })
})
