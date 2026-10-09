import { createTheme } from '@mui/material'

export function getTheme(mode) {
  return createTheme({
    palette: {
      mode,
      primary: { main: mode === 'light' ? '#2e7d32' : '#66bb6a' },
      secondary: { main: mode === 'light' ? '#8d6e63' : '#bcaaa4' },
      ...(mode === 'light' && { background: { default: '#f6f7f2' } }),
    },
    shape: { borderRadius: 8 },
  })
}
