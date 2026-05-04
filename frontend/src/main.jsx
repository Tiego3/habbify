import { createRoot } from 'react-dom/client'
import './globals.css'
import App from './App.jsx'
import { useAuthStore } from './store'

useAuthStore.getState().init()

createRoot(document.getElementById('root')).render(<App />)
