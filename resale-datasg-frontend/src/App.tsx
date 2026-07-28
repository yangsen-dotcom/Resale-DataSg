import { Route, Routes } from 'react-router-dom'
import { AppHeader } from './components/layout/AppHeader'
import { ExplorePage } from './pages/ExplorePage'
import { InsightsPage } from './pages/InsightsPage'
import './App.css'

function App() {
  return (
    <>
      <AppHeader />
      <div className="appContainer">
        <Routes>
          <Route path="/" element={<ExplorePage />} />
          <Route path="/insights" element={<InsightsPage />} />
        </Routes>
      </div>
    </>
  )
}

export default App
