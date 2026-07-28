import type { SortState, TransactionResponse } from '../../api/types'
import styles from './TransactionTable.module.css'

interface Column {
  key: keyof TransactionResponse
  label: string
  sortField?: SortState['field']
  numeric?: boolean
}

const COLUMNS: Column[] = [
  { key: 'month', label: 'Month', sortField: 'month' },
  { key: 'town', label: 'Town', sortField: 'town' },
  { key: 'flatType', label: 'Flat Type', sortField: 'flatType' },
  { key: 'block', label: 'Block', sortField: 'block' },
  { key: 'streetName', label: 'Street', sortField: 'streetName' },
  { key: 'storeyRange', label: 'Storey', sortField: 'storeyRange' },
  { key: 'floorAreaSqm', label: 'Area (sqm)', sortField: 'floorAreaSqm', numeric: true },
  { key: 'flatModel', label: 'Model' },
  { key: 'remainingLease', label: 'Remaining Lease', sortField: 'remainingLease' },
  { key: 'resalePrice', label: 'Resale Price (SGD)', sortField: 'resalePrice', numeric: true },
]

const PRICE_FORMATTER = new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 })

interface TransactionTableProps {
  transactions: TransactionResponse[]
  sort: SortState
  onSortChange: (field: SortState['field']) => void
}

export function TransactionTable({ transactions, sort, onSortChange }: TransactionTableProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <th key={column.key} className={column.numeric ? styles.numericCell : undefined}>
                {column.sortField ? (
                  <button
                    type="button"
                    className={styles.sortButton}
                    onClick={() => onSortChange(column.sortField as SortState['field'])}
                    aria-pressed={sort.field === column.sortField}
                  >
                    {column.label}
                    <span className={styles.sortIndicator}>
                      {sort.field === column.sortField ? (sort.direction === 'asc' ? ' ▲' : ' ▼') : ''}
                    </span>
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((row) => (
            <tr key={row.id}>
              <td>{row.month}</td>
              <td>{row.town}</td>
              <td>{row.flatType}</td>
              <td>{row.block}</td>
              <td>{row.streetName}</td>
              <td>{row.storeyRange}</td>
              <td className={styles.numericCell}>{row.floorAreaSqm}</td>
              <td>{row.flatModel}</td>
              <td>{row.remainingLease}</td>
              <td className={styles.numericCell}>{PRICE_FORMATTER.format(row.resalePrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
