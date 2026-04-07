import React, { useState, useEffect } from 'react';
import { Square, Loader2, Clock, Activity } from 'lucide-react';
import { Progress } from '../../types';
import { useTheme } from '../../hooks/useTheme';

interface RunningOverlayProps {
    progress: Progress;
    onStop: () => void;
}

const Overlay: React.FC<RunningOverlayProps> = ({ progress, onStop }) => {
    const [elapsed, setElapsed] = useState(0);
    const { isDark } = useTheme();

    useEffect(() => {
        const timer = setInterval(() => {
            if (progress.startTime) setElapsed(Math.floor((Date.now() - progress.startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [progress.startTime]);

    // Calculate percentage for progress bar in static mode
    const progressPercentage = progress.mode === 'static' && progress.total
        ? Math.round((progress.current / progress.total) * 100)
        : 0;

    return (
        <div className={`fixed inset-0 backdrop-blur-md z-[100] flex items-center justify-center p-8 transition-colors duration-300 ${isDark ? 'bg-black/90' : 'bg-slate-900/40'}`}>
            <div className={`w-full max-w-md border rounded-3xl shadow-2xl p-12 flex flex-col items-center transition-all ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-300'}`}>
                <div className="relative mb-10">
                    <Loader2 size={40} className={`animate-spin ${isDark ? 'text-white' : 'text-slate-900'}`} strokeWidth={3} />
                    <div className={`absolute inset-0 blur-xl animate-pulse rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-900/10'}`} />
                </div>

                <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Stress Testing</h2>
                <p className={`text-xs font-bold uppercase tracking-[0.3em] mt-3 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>{progress.stage}</p>

                <div className={`w-full h-2 rounded-full mt-12 overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}>
                    {progress.mode === 'static' && (
                        <div className={`h-full transition-[width] duration-150 ease-out ${isDark ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'bg-slate-900 shadow-[0_0_10px_rgba(15,23,42,0.1)]'}`} style={{ width: `${progressPercentage}%` }} />
                    )}
                    {progress.mode === 'generator' && (
                        <div className={`h-full w-full animate-pulse ${isDark ? 'bg-zinc-700' : 'bg-slate-300'}`} />
                    )}
                </div>

                <div className="w-full grid grid-cols-2 gap-6 mt-10">
                    <div className={`flex flex-col items-center p-5 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-100 border-slate-200'}`}>
                        <span className={`text-[10px] font-bold uppercase mb-2 flex items-center gap-1.5 tracking-widest ${isDark ? 'text-zinc-600' : 'text-slate-500'}`}>
                            <Clock size={10} /> Elapsed
                        </span>
                        <span className={`text-lg font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                    <div className={`flex flex-col items-center p-5 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-100 border-slate-200'}`}>
                        <span className={`text-[10px] font-bold uppercase mb-2 flex items-center gap-1.5 tracking-widest ${isDark ? 'text-zinc-600' : 'text-slate-500'}`}>
                            <Activity size={10} /> {progress.mode === 'generator' ? 'Tests Passed' : 'Test Cases'}
                        </span>
                        <span className={`text-lg font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {progress.mode === 'static' && progress.total
                                ? `${progress.current} / ${progress.total}`
                                : progress.current
                            }
                        </span>
                    </div>
                </div>

                <button
                    onClick={onStop}
                    className={`mt-12 w-full py-5 flex items-center justify-center gap-3 font-bold text-sm rounded-2xl transition-all hover:scale-[1.02] shadow-lg ${isDark ? 'border border-red-900/50 text-red-500 hover:bg-red-950 shadow-red-950/20' : 'bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 shadow-red-100/30'}`}
                >
                    <Square size={14} className="fill-current" />
                    TERMINATE PROCESS
                </button>
            </div>
        </div>
    );
};

export default Overlay;
