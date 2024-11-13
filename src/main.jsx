import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DropList from './components/DropList.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
