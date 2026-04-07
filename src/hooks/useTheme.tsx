import React, { createContext, useContext, useMemo } from 'react';

interface ThemeContextValue {
    theme: 'dark' | 'light';
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: 'dark',
    isDark: true,
});

export const ThemeProvider: React.FC<{
    theme: 'dark' | 'light';
    children: React.ReactNode;
}> = ({ theme, children }) => {
    const value = useMemo<ThemeContextValue>(
        () => ({ theme, isDark: theme === 'dark' }),
        [theme],
    );
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
    return useContext(ThemeContext);
}
