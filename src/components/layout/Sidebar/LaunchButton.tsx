import React from 'react';
import { AppMode } from '../../../types';
import { useTheme } from '../../../hooks/useTheme';

interface LaunchButtonProps {
    appState: AppMode;
    onStart: () => void;
}

const LaunchButton: React.FC<LaunchButtonProps> = ({ appState, onStart }) => {
    const { isDark } = useTheme();

    return (
        <button
            onClick={onStart}
            disabled={appState !== 'READY'}
            className={`w-full py-4 rounded-xl font-bold text-sm tracking-widest transition-all duration-300 ${appState === 'READY'
                ? (isDark ? 'bg-neutral-700 text-neutral-200 hover:bg-neutral-600 shadow-lg shadow-neutral-900/20' : 'bg-black text-white hover:bg-zinc-900 shadow-lg shadow-black/10')
                : (isDark ? 'bg-neutral-900 text-neutral-600 cursor-not-allowed border border-neutral-800' : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300')
                }`}
        >
            {appState === 'READY' ? 'LAUNCH STRESS TEST' : 'UPLOAD FILES TO START'}
        </button>
    );
};

export default LaunchButton;