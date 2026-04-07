import React from 'react';
import { ComparisonResult, FileData, UploadedFiles } from '../../../types';
import PreviewView from './PreviewView';
import StatusView from './StatusView';
import ResultsView from './results';

interface MainPanelProps {
    activeTab: 'preview' | 'results' | 'status';
    previewFile: { slot: keyof UploadedFiles; data: FileData } | null;
    result: ComparisonResult | null;
    compilerStatus: any;
    isRefreshingCompilers: boolean;
    onRefreshCompilers: () => void;
    api: any;
}

const MainPanel: React.FC<MainPanelProps> = ({
    activeTab,
    previewFile,
    result,
    compilerStatus,
    isRefreshingCompilers,
    onRefreshCompilers,
    api,
}) => {
    if (activeTab === 'status') {
        return (
            <StatusView
                status={compilerStatus}
                onRefresh={onRefreshCompilers}
                isRefreshing={isRefreshingCompilers}
            />
        );
    }

    if (activeTab === 'results') {
        return <ResultsView result={result} />;
    }

    return <PreviewView previewFile={previewFile} api={api} />;
};

export default MainPanel;