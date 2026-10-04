import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material'
import App from './App.jsx'

const theme = createTheme({
  palette: {
    primary: { main: '#2e7d32' },
    secondary: { main: '#8d6e63' },
    background: { default: '#f6f7f2' },
  },
  shape: { borderRadius: 8 },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
