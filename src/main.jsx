import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { AppThemeProvider } from './components/AppThemeProvider';
import { CssBaseline } from '@mui/material';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppThemeProvider>
        <CssBaseline />
        <App />
      </AppThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
