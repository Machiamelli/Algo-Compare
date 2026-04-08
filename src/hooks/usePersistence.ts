import { useState, useEffect } from 'react';
import { Config } from '../types';

export const usePersistence = () => {
    // Theme Persistence
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
        }
        return 'dark';
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Config Persistence
    const [config, setConfig] = useState<Config>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('config');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error('Failed to parse saved config', e);
                }
            }
        }
        return {
            timeLimit: 1000,
            mode: 'static',
        };
    });

    useEffect(() => {
        localStorage.setItem('config', JSON.stringify(config));
    }, [config]);

    return {
        theme,
        setTheme,
        config,
        setConfig,
    };
};
