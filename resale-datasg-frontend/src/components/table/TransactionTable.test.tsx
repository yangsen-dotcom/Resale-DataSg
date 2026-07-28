import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionTable } from './TransactionTable'
import type { TransactionResponse } from '../../api/types'

const rows: TransactionResponse[] = [
  {
    id: 1,
    month: '2023-06',
    town: 'BEDOK',
    flatType: '4 ROOM',
    block: '123',
    streetName: 'BEDOK NORTH RD',
    storeyRange: '07 TO 09',
    floorAreaSqm: 92,
    flatModel: 'New Generation',
    leaseCommenceDate: 1980,
    remainingLease: '56 years 01 month',
    resalePrice: 520000,
  },
]

describe('TransactionTable', () => {
  it('renders row values', () => {
    render(<TransactionTable transactions={rows} sort={{ field: 'month', direction: 'desc' }} onSortChange={() => {}} />)

    expect(screen.getByText('BEDOK')).toBeInTheDocument()
    expect(screen.getByText('4 ROOM')).toBeInTheDocument()
    expect(screen.getByText('$520,000')).toBeInTheDocument()
  })

  it('calls onSortChange with the clicked column field', async () => {
    const onSortChange = vi.fn()
    render(<TransactionTable transactions={rows} sort={{ field: 'month', direction: 'desc' }} onSortChange={onSortChange} />)

    await userEvent.click(screen.getByRole('button', { name: /town/i }))

    expect(onSortChange).toHaveBeenCalledWith('town')
  })

  it('shows the active sort direction indicator', () => {
    render(<TransactionTable transactions={rows} sort={{ field: 'resalePrice', direction: 'asc' }} onSortChange={() => {}} />)

    expect(screen.getByRole('button', { name: /resale price.*▲/i })).toBeInTheDocument()
  })
})
