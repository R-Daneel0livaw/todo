import { ReactNode, useState } from 'react'
import { Route } from '@renderer/navigation/types'
import * as DevService from '@renderer/services/DevService'
import styles from './Layout.module.css'

interface LayoutProps {
  history: Route[]
  onNavigateTopLevel: (route: Route) => void
  onNavigateToIndex: (index: number) => void
  children: ReactNode
}

const routeLabel = (route: Route): string => {
  switch (route.page) {
    case 'daily-log':
      return 'Daily Log'
    case 'collections':
      return 'Collections'
    case 'collection-detail':
      return route.label
  }
}

const Layout = ({ history, onNavigateTopLevel, onNavigateToIndex, children }: LayoutProps) => {
  const topLevel = history[0].page
  const [resetting, setResetting] = useState(false)

  const handleResetDb = async () => {
    if (!window.confirm('Reset the database? This wipes all data and reseeds test data.')) return
    setResetting(true)
    try {
      await DevService.resetDatabase()
      window.location.reload()
    } catch (err) {
      console.error('Failed to reset database:', err)
      setResetting(false)
    }
  }

  return (
    <div className={styles.layout}>
      <nav className={styles.nav}>
        <button
          className={`${styles.navLink} ${topLevel === 'daily-log' ? styles.navLinkActive : ''}`}
          onClick={() => onNavigateTopLevel({ page: 'daily-log' })}
        >
          Daily Log
        </button>
        <button
          className={`${styles.navLink} ${topLevel === 'collections' ? styles.navLinkActive : ''}`}
          onClick={() => onNavigateTopLevel({ page: 'collections' })}
        >
          Collections
        </button>
        {import.meta.env.DEV && (
          <button
            className={styles.devResetButton}
            onClick={handleResetDb}
            disabled={resetting}
            title="Dev only: wipe and reseed the database"
          >
            {resetting ? 'Resetting…' : '⟳ Reset DB'}
          </button>
        )}
      </nav>
      {history.length > 1 && (
        <div className={styles.breadcrumbs}>
          {history.map((route, index) => (
            <span key={index} className={styles.breadcrumbItem}>
              {index > 0 && <span className={styles.breadcrumbSeparator}>/</span>}
              {index === history.length - 1 ? (
                <span className={styles.breadcrumbCurrent}>{routeLabel(route)}</span>
              ) : (
                <button className={styles.breadcrumbLink} onClick={() => onNavigateToIndex(index)}>
                  {routeLabel(route)}
                </button>
              )}
            </span>
          ))}
        </div>
      )}
      <main className={styles.content}>{children}</main>
    </div>
  )
}

export default Layout
