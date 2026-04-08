import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import CopyButton from './CopyButton';

interface TestCaseBoxProps {
    testCase: number;
    content: string;
}

const TestCaseBox: React.FC<TestCaseBoxProps> = ({ testCase, content }) => {
    const { isDark } = useTheme();

    return (
        <div
            className={`border rounded-xl overflow-hidden shadow-lg ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-300'
                }`}
        >
            <div
                className={`px-6 py-3 border-b flex items-center justify-between ${isDark ? 'bg-zinc-800/50 border-zinc-800' : 'bg-slate-100 border-slate-300'
                    }`}
            >
                <span
                    className={`text-[11px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-400' : 'text-slate-600'
                        }`}
                >
                    Test case {testCase}
                </span>
                <CopyButton content={content} label="COPY TEST CASE" />
            </div>
            <div className="h-48 overflow-auto custom-scrollbar">
                <pre
                    className={`p-8 font-mono text-base whitespace-pre ${isDark ? 'text-zinc-300' : 'text-slate-700'
                        }`}
                >
                    {content}
                </pre>
            </div>
        </div>
    );
};

export default TestCaseBox;
