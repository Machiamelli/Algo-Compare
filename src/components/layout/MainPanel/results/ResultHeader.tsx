import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';

interface ResultHeaderProps {
    title: string;
    subtitle: string;
    success: boolean;
}

const ResultHeader: React.FC<ResultHeaderProps> = ({ title, subtitle, success }) => {
    const { isDark } = useTheme();

    const getIcon = () => {
        if (success) return <CheckCircle2 size={32} />;
        if (title.includes('Error')) return <AlertTriangle size={32} />;
        return <XCircle size={32} />;
    };

    return (
        <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-6">
                <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${success
                        ? isDark
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        : isDark
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : 'bg-red-50 border-red-200 text-red-600'
                        }`}
                >
                    {getIcon()}
                </div>
                <div>
                    <h1 className={`text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {title}
                    </h1>
                    <p className={`text-sm font-semibold mt-2 ${isDark ? 'text-zinc-500' : 'text-slate-600'}`}>
                        {subtitle}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResultHeader;