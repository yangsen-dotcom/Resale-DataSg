import { Route, Routes } from 'react-router-dom'
import { AppHeader } from './components/layout/AppHeader'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { ExplorePage } from './pages/ExplorePage'
import { MapPage } from './pages/MapPage'
import { InsightsPage } from './pages/InsightsPage'
import './App.css'

function App() {
  return (
    <>
      <AppHeader />
      <div className="appContainer">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<ExplorePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/insights" element={<InsightsPage />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </>
  )
}

export default App
