import React from 'react';
import { ComparisonResult } from '../../../../types';
import { useTheme } from '../../../../hooks/useTheme';
import ResultHeader from './ResultHeader';
import TestCaseBox from '../../../ui/TestCaseBox';
import ContentBox from '../../../ui/ContentBox';

interface ResultMismatchProps {
    result: ComparisonResult;
}

const ResultMismatch: React.FC<ResultMismatchProps> = ({ result }) => {
    const { isDark } = useTheme();
    const testsAnalyzed = result.testCase || result.testsPassed || 0;

    return (
        <div
            className={`h-full overflow-y-auto p-12 transition-colors duration-300 ${isDark ? 'bg-zinc-950' : 'bg-slate-200'
                }`}
        >
            <div className="max-w-5xl mx-auto">
                <ResultHeader
                    title="Output Mismatch"
                    subtitle={`Stress test completed. Processed ${testsAnalyzed} test case${testsAnalyzed !== 1 ? 's' : ''}.`}
                    success={false}
                />

                <div className="space-y-8">
                    <TestCaseBox testCase={result.testCase || 1} content={result.input || ''} />

                    <div className="grid grid-cols-2 gap-8">
                        <ContentBox
                            title="Expected Output"
                            content={result.expectedOutput || ''}
                            isError={false}
                        />
                        <ContentBox
                            title="Your Output"
                            content={result.actualOutput || ''}
                            isError={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultMismatch;
