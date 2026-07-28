import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../test/testUtils'
import { FilterPanel } from './FilterPanel'
import type { TransactionFilters } from '../../api/types'

const emptyFilters: TransactionFilters = {
  town: [],
  flatType: [],
  minPrice: '',
  maxPrice: '',
  fromMonth: '',
  toMonth: '',
}

describe('FilterPanel', () => {
  it('calls onChange with the selected town', async () => {
    const onChange = vi.fn()
    renderWithProviders(<FilterPanel filters={emptyFilters} onChange={onChange} />)

    const checkbox = await screen.findByLabelText('BEDOK')
    await userEvent.click(checkbox)

    expect(onChange).toHaveBeenCalledWith({ town: ['BEDOK'] })
  })

  it('unchecks an already-selected town', async () => {
    const onChange = vi.fn()
    renderWithProviders(<FilterPanel filters={{ ...emptyFilters, town: ['BEDOK'] }} onChange={onChange} />)

    const checkbox = await screen.findByLabelText('BEDOK')
    await userEvent.click(checkbox)

    expect(onChange).toHaveBeenCalledWith({ town: [] })
  })

  it('debounces the minimum price input before calling onChange', async () => {
    const onChange = vi.fn()
    renderWithProviders(<FilterPanel filters={emptyFilters} onChange={onChange} />)

    const minInput = screen.getByLabelText('Minimum price')
    await userEvent.type(minInput, '500000')

    expect(onChange).not.toHaveBeenCalled()
    await waitFor(() => expect(onChange).toHaveBeenCalledWith({ minPrice: '500000' }), { timeout: 1000 })
  })
})
