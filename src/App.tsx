import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Board from './pages/Board'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/board" element={<Board />} />
      </Routes>
    </BrowserRouter>
  )
}
