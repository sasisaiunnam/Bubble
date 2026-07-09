import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { AppThemeProvider } from './components/AppThemeProvider';
import { CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';

import './index.css'
import App from './App.jsx'
import store from './store/store.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AppThemeProvider>
          <CssBaseline />
          <App />
        </AppThemeProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
