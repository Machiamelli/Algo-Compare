import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ComparisonResult } from '../../../../types';
import { useTheme } from '../../../../hooks/useTheme';
import ResultHeader from './ResultHeader';

interface ResultSuccessProps {
    result: ComparisonResult;
}

const ResultSuccess: React.FC<ResultSuccessProps> = ({ result }) => {
    const { isDark } = useTheme();
    const testsAnalyzed = result.testCase || result.testsPassed || 0;

    return (
        <div
            className={`h-full overflow-y-auto p-12 flex flex-col transition-colors duration-300 ${isDark ? 'bg-zinc-950' : 'bg-slate-200'
                }`}
        >
            <div className="max-w-5xl mx-auto w-full flex flex-col flex-1">
                <ResultHeader
                    title="All Tests Passed"
                    subtitle={`Stress test completed. Processed ${testsAnalyzed} test case${testsAnalyzed !== 1 ? 's' : ''}.`}
                    success={true}
                />

                <div className="flex flex-col items-center justify-center text-center flex-1 pb-50">
                    <CheckCircle2 size={70} className="text-emerald-500 mb-4" />
                    <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        No Mismatch Found
                    </h3>
                    <p className={`text-base mt-4 max-w-md ${isDark ? 'text-zinc-500' : 'text-slate-600'}`}>
                        Both solutions returned identical outputs for the provided test cases.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResultSuccess;