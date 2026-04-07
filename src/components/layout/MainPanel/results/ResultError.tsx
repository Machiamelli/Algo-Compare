import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { ComparisonResult } from '../../../../types';
import { useTheme } from '../../../../hooks/useTheme';
import ResultHeader from './ResultHeader';
import TestCaseBox from '../../../ui/TestCaseBox';
import CopyButton from '../../../ui/CopyButton';

interface ResultErrorProps {
    result: ComparisonResult;
}

const ResultError: React.FC<ResultErrorProps> = ({ result }) => {
    const { isDark } = useTheme();
    const testsAnalyzed = result.testCase || result.testsPassed || 0;

    const getFailedSlotLabel = () => {
        if (result.failedSlot === 'A') return 'Brute Force Solution';
        if (result.failedSlot === 'B') return 'Untested Solution';
        if (result.failedSlot === 'generator') return 'Test Generator';
        return 'Program';
    };

    const isCompilationError = result.failureType === 'COMPILATION_ERROR';

    return (
        <div
            className={`h-full overflow-y-auto p-12 transition-colors duration-300 ${isDark ? 'bg-zinc-950' : 'bg-slate-200'
                }`}
        >
            <div className="max-w-5xl mx-auto">
                <ResultHeader
                    title={isCompilationError ? 'Compilation Failed' : 'Runtime Error Detected'}
                    subtitle={`Stress test completed. Processed ${testsAnalyzed} test case${testsAnalyzed !== 1 ? 's' : ''}.`}
                    success={false}
                />

                <div className="space-y-8">
                    {/* Error Summary */}
                    <div
                        className={`border rounded-xl p-6 shadow-lg ${isDark ? 'bg-red-950/20 border-red-500/20' : 'bg-red-50 border-red-100'
                            }`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <AlertTriangle size={20} className="text-red-500" />
                            <h3
                                className={`font-bold text-sm uppercase tracking-wider ${isDark ? 'text-red-400' : 'text-red-700'
                                    }`}
                            >
                                {isCompilationError ? 'Compilation Error' : 'Runtime Error'}
                            </h3>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                            The <span className="font-semibold">{getFailedSlotLabel()}</span> encountered an error during{' '}
                            {isCompilationError ? 'compilation' : 'execution'}.
                        </p>
                        {!isCompilationError && result.exitCode !== undefined && (
                            <p className={`text-xs mt-2 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                                Exit Code: {result.exitCode}
                            </p>
                        )}
                    </div>

                    {/* Test Case Input (only for runtime errors) */}
                    {!isCompilationError && result.input && (
                        <TestCaseBox testCase={result.testCase || 1} content={result.input} />
                    )}

                    {/* Error Output */}
                    <ErrorBox
                        title={isCompilationError ? 'Compilation Output' : 'Error Output'}
                        content={result.stderr || result.error || 'No error details available'}
                    />
                </div>
            </div>
        </div>
    );
};

const ErrorBox: React.FC<{ title: string; content: string }> = ({
    title,
    content,
}) => {
    const { isDark } = useTheme();

    return (
        <div
            className={`rounded-xl border shadow-lg ${isDark ? 'border-red-500/20 bg-red-950/20' : 'border-red-100 bg-red-50/50'
                }`}
        >
            <div
                className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-red-500/10' : 'border-red-100'
                    }`}
            >
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-400">{title}</span>
                <CopyButton content={content} label="COPY ERROR" />
            </div>
            <div className="h-96 overflow-auto custom-scrollbar">
                <pre
                    className={`p-8 font-mono text-sm whitespace-pre ${isDark ? 'text-red-300' : 'text-red-700'
                        }`}
                >
                    {content}
                </pre>
            </div>
        </div>
    );
};



export default ResultError;