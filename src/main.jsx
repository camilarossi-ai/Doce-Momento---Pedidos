import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Painel from './Painel.jsx'
import './index.css'

const isPainel = window.location.pathname.replace(/\/$/, '') === '/painel'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isPainel ? <Painel /> : <App />}
  </React.StrictMode>,
)
