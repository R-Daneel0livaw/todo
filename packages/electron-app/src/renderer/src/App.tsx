import { useState } from 'react'
import Layout from '@renderer/components/Layout/Layout'
import DailyLogPage from './pages/DailyLogPage'
import CollectionsPage from './pages/CollectionsPage/CollectionsPage'
import CollectionDetailPage from './pages/CollectionDetailPage/CollectionDetailPage'
import { Route } from '@renderer/navigation/types'

function App() {
  const [history, setHistory] = useState<Route[]>([{ page: 'daily-log' }])
  const route = history[history.length - 1]

  const navigate = (next: Route) => {
    setHistory((prev) => [...prev, next])
  }

  const navigateTopLevel = (next: Route) => {
    setHistory([next])
  }

  const navigateToIndex = (index: number) => {
    setHistory((prev) => prev.slice(0, index + 1))
  }

  const renderPage = () => {
    switch (route.page) {
      case 'daily-log':
        return <DailyLogPage />
      case 'collections':
        return <CollectionsPage onNavigate={navigate} />
      case 'collection-detail':
        return (
          <CollectionDetailPage
            key={route.collectionId}
            collectionId={route.collectionId}
            onNavigate={navigate}
          />
        )
    }
  }

  return (
    <Layout history={history} onNavigateTopLevel={navigateTopLevel} onNavigateToIndex={navigateToIndex}>
      {renderPage()}
    </Layout>
  )
}

export default App
