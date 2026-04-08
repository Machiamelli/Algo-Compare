import React from 'react';
import { RefreshCw, CornerDownRight } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';

interface StatusViewProps {
    status: any;
    onRefresh: () => void;
    isRefreshing: boolean;
}

const StatusView: React.FC<StatusViewProps> = ({ status, onRefresh, isRefreshing }) => {
    const { isDark } = useTheme();

    return (
        <div
            className={`h-full p-16 overflow-y-auto custom-scrollbar transition-colors duration-300 ${isDark ? 'bg-zinc-950' : 'bg-slate-200'
                }`}
        >
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1
                            className={`text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'
                                }`}
                        >
                            Environment Diagnostics
                        </h1>
                        <p className={`text-base mt-3 font-medium ${isDark ? 'text-zinc-500' : 'text-slate-600'}`}>
                            Status of system compilers and binary runtimes.
                        </p>
                    </div>
                    <button
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className={`p-3 border rounded-xl transition-all shadow-heavy ${isDark
                            ? 'border-zinc-800 text-zinc-500 hover:text-white bg-zinc-900'
                            : 'border-slate-300 text-slate-500 hover:text-slate-900 bg-white'
                            } ${isRefreshing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                    >
                        <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <RuntimeRow label="Python 3.x" data={status?.all?.python || []} />
                    <RuntimeRow label="LLVM / GCC Toolchain" data={status?.all?.cpp || []} />
                    <RuntimeRow label="Java Virtual Machine" data={status?.all?.java || []} />
                </div>
            </div>
        </div>
    );
};

const RuntimeRow: React.FC<{ label: string; data: any[] }> = ({
    label,
    data,
}) => {
    const { isDark } = useTheme();

    return (
        <div
            className={`border rounded-2xl p-8 shadow-lg transition-all ${isDark
                ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-900/80'
                : 'bg-white border-slate-300 hover:shadow-xl'
                }`}
        >
            <div className="flex items-center justify-between mb-6">
                <span
                    className={`text-sm font-bold uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-700'
                        }`}
                >
                    {label}
                </span>
                <span
                    className={`text-[11px] font-bold px-3 py-1 rounded-full border ${data.length
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}
                >
                    {data.length ? 'VERIFIED' : 'UNAVAILABLE'}
                </span>
            </div>
            <div className="space-y-4">
                {data.map((item: any, i: number) => (
                    <div
                        key={i}
                        className={`flex items-start gap-4 p-4 rounded-xl border ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-slate-100 border-slate-200'
                            }`}
                    >
                        <CornerDownRight size={14} className={`mt-1 ${isDark ? 'text-zinc-700' : 'text-slate-400'}`} />
                        <div className="flex-1">
                            <p className={`text-sm font-mono ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                                {item.path}
                            </p>
                            {item.version && (
                                <p className={`text-xs mt-1 ${isDark ? 'text-zinc-600' : 'text-slate-500'}`}>
                                    {item.version}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
                {data.length === 0 && (
                    <p className={`text-sm italic px-4 ${isDark ? 'text-zinc-600' : 'text-slate-500'}`}>
                        No installation detected in system PATH.
                    </p>
                )}
            </div>
        </div>
    );
};

export default StatusView;