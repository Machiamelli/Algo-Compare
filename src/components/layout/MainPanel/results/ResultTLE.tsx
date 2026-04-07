import React from 'react';
import { Clock } from 'lucide-react';
import { ComparisonResult } from '../../../../types';
import { useTheme } from '../../../../hooks/useTheme';
import ResultHeader from './ResultHeader';
import TestCaseBox from '../../../ui/TestCaseBox';

interface ResultTLEProps {
    result: ComparisonResult;
}

const ResultTLE: React.FC<ResultTLEProps> = ({ result }) => {
    const { isDark } = useTheme();
    const testsAnalyzed = result.testCase || result.testsPassed || 0;

    const getFailedSlotLabel = () => {
        if (result.failedSlot === 'A') return 'Brute Force Solution';
        if (result.failedSlot === 'B') return 'Untested Solution';
        if (result.failedSlot === 'generator') return 'Test Generator';
        return 'Unknown';
    };

    return (
        <div
            className={`h-full overflow-y-auto p-12 transition-colors duration-300 ${isDark ? 'bg-zinc-950' : 'bg-slate-200'
                }`}
        >
            <div className="max-w-5xl mx-auto">
                <ResultHeader
                    title="Time Limit Exceeded"
                    subtitle={`Stress test completed. Processed ${testsAnalyzed} test case${testsAnalyzed !== 1 ? 's' : ''}.`}
                    success={false}
                />

                <div className="space-y-8">
                    <div
                        className={`border rounded-xl p-6 shadow-lg ${isDark ? 'bg-yellow-950/20 border-yellow-500/20' : 'bg-yellow-50 border-yellow-100'
                            }`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <Clock size={20} className="text-yellow-500" />
                            <h3
                                className={`font-bold text-sm uppercase tracking-wider ${isDark ? 'text-yellow-400' : 'text-yellow-700'
                                    }`}
                            >
                                Execution Timeout
                            </h3>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                            The <span className="font-semibold">{getFailedSlotLabel()}</span> exceeded the maximum
                            allowed execution time.
                        </p>
                    </div>

                    {result.input && <TestCaseBox testCase={result.testCase || 1} content={result.input} />}
                </div>
            </div>
        </div>
    );
};

export default ResultTLE;