import { Component, type ErrorInfo, type ReactNode } from 'react'
import styles from './States.module.css'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Catches rendering errors anywhere in the tree below it and shows a fallback
 * instead of an unhandled error taking down the whole app to a blank screen.
 * Must be a class component — React only invokes getDerivedStateFromError /
 * componentDidCatch on class components, there's no hook equivalent.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled error in component tree', error, errorInfo)
  }

  render() {
    if (this.state.error) {
      return (
        <div role="alert" className={styles.state}>
          <svg
            className={styles.iconDanger}
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9.25" />
            <line x1="12" y1="7.5" x2="12" y2="13" />
            <circle cx="12" cy="16.25" r="0.9" fill="currentColor" stroke="none" />
          </svg>
          <p className={styles.message}>Something went wrong loading this page.</p>
          <button type="button" className={styles.retryButton} onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
