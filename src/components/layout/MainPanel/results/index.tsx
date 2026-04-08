import React from 'react';
import { Activity } from 'lucide-react';
import { ComparisonResult } from '../../../../types';
import { useTheme } from '../../../../hooks/useTheme';
import ResultSuccess from './ResultSuccess';
import ResultMismatch from './ResultMismatch';
import ResultTLE from './ResultTLE';
import ResultError from './ResultError';

interface ResultsViewProps {
    result: ComparisonResult | null;
}

const ResultsView: React.FC<ResultsViewProps> = ({ result }) => {
    const { isDark } = useTheme();

    if (!result) {
        return (
            <div
                className={`h-full flex flex-col items-center justify-center transition-colors duration-300 ${isDark ? 'bg-zinc-950 text-zinc-800' : 'bg-slate-200 text-slate-400'
                    }`}
            >
                <Activity size={64} strokeWidth={1.5} />
                <p
                    className={`text-sm font-bold mt-6 tracking-[0.2em] uppercase ${isDark ? 'text-zinc-700' : 'text-slate-500'
                        }`}
                >
                    No Analysis Data Available
                </p>
            </div>
        );
    }

    // Success case
    if (result.success) {
        return <ResultSuccess result={result} />;
    }

    // Error cases
    if (result.failureType === 'RUNTIME_ERROR' || result.failureType === 'COMPILATION_ERROR') {
        return <ResultError result={result} />;
    }

    // TLE case
    if (result.failureType === 'TLE') {
        return <ResultTLE result={result} />;
    }

    // Mismatch case
    if (result.failureType === 'MISMATCH') {
        return <ResultMismatch result={result} />;
    }

    // Fallback — unknown failure type
    return <ResultError result={result} />;
};

export default ResultsView;