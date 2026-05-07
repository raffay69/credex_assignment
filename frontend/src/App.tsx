import { BrowserRouter, Route, Routes } from 'react-router'
import Home from './pages/Home'
import SharedAuditView from './pages/Share'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/share/:id' element={<SharedAuditView />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
