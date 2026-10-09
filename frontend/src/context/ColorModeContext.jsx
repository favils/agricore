import { createContext, useContext, useMemo, useState } from 'react';
import { CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import { getTheme } from '../theme.js';

const ColorModeContext = createContext(null);

function readStoredMode() {
    try {
        const stored = localStorage.getItem('colorMode');
        return stored === 'light' || stored === 'dark' ? stored : null;
    } catch {
        return null;
    }
}

export function ColorModeProvider({ children }) {
    const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
    const [storedMode, setStoredMode] = useState(readStoredMode);
    const mode = storedMode ?? (prefersDark ? 'dark' : 'light');
    const theme = useMemo(() => getTheme(mode), [mode]);

    const toggleColorMode = () => {
        const next = mode === 'light' ? 'dark' : 'light';
        setStoredMode(next);
        localStorage.setItem('colorMode', next);
    };

    return (
        <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}

export function useColorMode() {
    return useContext(ColorModeContext);
}
