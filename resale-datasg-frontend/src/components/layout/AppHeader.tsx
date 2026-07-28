import { NavLink } from 'react-router-dom'
import styles from './AppHeader.module.css'

export function AppHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.mark} aria-hidden="true" />
          <span className={styles.title}>Resale-DataSg</span>
        </div>
        <nav className={styles.nav}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
            Explore
          </NavLink>
          <NavLink to="/map" className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
            Map
          </NavLink>
          <NavLink to="/insights" className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
            Insights
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
