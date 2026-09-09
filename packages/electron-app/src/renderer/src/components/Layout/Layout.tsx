import { ReactNode } from 'react'
import { Route } from '@renderer/navigation/types'
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
