import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import LegacyHome from './pages/LegacyHome'
import RoseDay from './pages/RoseDay'
import ProposeDay from './pages/ProposeDay'
import ChocolateDay from './pages/ChocolateDay'
import TeddyDay from './pages/TeddyDay'
import PromiseDay from './pages/PromiseDay'
import HugDay from './pages/HugDay'
import KissDay from './pages/KissDay'
import ValentinesDay from './pages/ValentinesDay'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/legacy-home" element={<LegacyHome />} />
      <Route path="/rose-day" element={<RoseDay />} />
      <Route path="/propose-day" element={<ProposeDay />} />
      <Route path="/chocolate-day" element={<ChocolateDay />} />
      <Route path="/teddy-day" element={<TeddyDay />} />
      <Route path="/promise-day" element={<PromiseDay />} />
      <Route path="/hug-day" element={<HugDay />} />
      <Route path="/kiss-day" element={<KissDay />} />
      <Route path="/valentines-day" element={<ValentinesDay />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
