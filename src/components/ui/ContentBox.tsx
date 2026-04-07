import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import CopyButton from './CopyButton';

interface ContentBoxProps {
    title: string;
    content: string;
    isError?: boolean;
    copyLabel?: string;
}

const ContentBox: React.FC<ContentBoxProps> = ({
    title,
    content,
    isError = false,
    copyLabel = 'COPY',
}) => {
    const { isDark } = useTheme();

    return (
        <div
            className={`rounded-xl border shadow-lg ${isError
                ? isDark
                    ? 'border-red-500/20 bg-red-950/20'
                    : 'border-red-100 bg-red-50/50'
                : isDark
                    ? 'border-zinc-800 bg-zinc-900'
                    : 'border-slate-300 bg-white'
                }`}
        >
            <div
                className={`px-6 py-4 border-b flex items-center justify-between ${isError
                    ? isDark
                        ? 'border-red-500/10'
                        : 'border-red-100'
                    : isDark
                        ? 'border-zinc-800'
                        : 'border-slate-100'
                    }`}
            >
                <span
                    className={`text-[11px] font-bold uppercase tracking-[0.2em] ${isError ? 'text-red-400' : isDark ? 'text-zinc-500' : 'text-slate-500'
                        }`}
                >
                    {title}
                </span>
                <CopyButton content={content} label={copyLabel} />
            </div>
            <div className="h-48 overflow-auto custom-scrollbar">
                <pre
                    className={`p-4 font-mono text-sm whitespace-pre ${isError
                        ? isDark
                            ? 'text-red-300'
                            : 'text-red-700'
                        : isDark
                            ? 'text-zinc-300'
                            : 'text-slate-700'
                        }`}
                >
                    {content}
                </pre>
            </div>
        </div>
    );
};

export default ContentBox;
