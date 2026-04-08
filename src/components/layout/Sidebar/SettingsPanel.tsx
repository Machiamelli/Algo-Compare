import React from 'react';
import { Clock } from 'lucide-react';
import { Config } from '../../../types';
import { useTheme } from '../../../hooks/useTheme';
import Dropdown from '../../ui/Dropdown';

interface SettingsPanelProps {
    config: Config;
    onConfigChange: (config: Config) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ config, onConfigChange }) => {
    const { isDark } = useTheme();

    return (
        <div className={`rounded-xl border p-5 space-y-4 ${isDark ? 'bg-black/30 border-neutral-800/60' : 'bg-slate-200 border-slate-300'}`}>
            <div>
                <label className={`block text-[11px] font-bold mb-2 uppercase tracking-wide ${isDark ? 'text-neutral-500' : 'text-slate-600'}`}>
                    Timeout (ms)
                </label>
                <div className={`flex items-center px-4 py-3 border rounded-lg focus-within:ring-2 transition-all ${isDark
                    ? 'bg-black/60 border-neutral-800 focus-within:border-neutral-500 focus-within:ring-neutral-400/10'
                    : 'bg-white border-slate-300 focus-within:border-slate-400 focus-within:ring-slate-900/5'
                    }`}>
                    <Clock size={18} className={isDark ? 'text-neutral-500' : 'text-slate-500'} />
                    <input
                        type="number"
                        value={config.timeLimit}
                        onChange={(e) => onConfigChange({ ...config, timeLimit: parseInt(e.target.value) || 0 })}
                        className={`w-full bg-transparent text-sm font-semibold ml-3 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none ${isDark ? 'text-neutral-200' : 'text-slate-900'
                            }`}
                    />
                </div>
            </div>

            <div>
                <label className={`block text-[11px] font-bold mb-2 uppercase tracking-wide ${isDark ? 'text-neutral-500' : 'text-slate-600'}`}>
                    Data Mode
                </label>
                <Dropdown
                    isDark={isDark}
                    selected={config.mode}
                    onSelect={(value) => onConfigChange({ ...config, mode: value })}
                />
            </div>
        </div>
    );
};

export default SettingsPanel;