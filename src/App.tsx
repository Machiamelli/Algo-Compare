import React, { useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import MainPanel from './components/layout/MainPanel';
import Header from './components/layout/Header';
import Overlay from './components/ui/Overlay';
import { ThemeProvider } from './hooks/useTheme';
import { usePersistence } from './hooks/usePersistence';
import { useCompilerStatus } from './hooks/useCompilerStatus';
import { useFileManager } from './hooks/useFileManager';
import { useComparison } from './hooks/useComparison';
import { useAppState } from './hooks/useAppState';
import { getElectronAPI } from './services/api';

const App: React.FC = () => {
  // Persistence (theme, config)
  const { theme, setTheme, config, setConfig } = usePersistence();

  // App state (mode, tabs)
  const { appState, activeTab, transitionTo, goToTab, setActiveTab } = useAppState();

  // Compiler detection
  const { status: compilerStatus, refresh: refreshCompilers, loading: isRefreshingCompilers } = useCompilerStatus();

  // File management
  const {
    uploadedFiles,
    previewFile,
    uploadFile,
    previewSlot,
    isReady,
    setPreviewFile,
  } = useFileManager();

  // Comparison execution
  const {
    running,
    progress,
    result,
    start: startComparison,
    stop: stopComparison,
  } = useComparison();

  const api = getElectronAPI();

  // Sync app state with comparison running state
  useEffect(() => {
    if (running) {
      transitionTo('RUNNING');
    } else if (isReady()) {
      transitionTo('READY');
    } else {
      transitionTo('IDLE');
    }
  }, [running, isReady, transitionTo]);

  // Switch to results tab when result is ready
  useEffect(() => {
    if (result && !running) {
      goToTab('results');
    }
  }, [result, running, goToTab]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleFileUpload = async (slot: keyof typeof uploadedFiles) => {
    const result = await uploadFile(slot);
    if (result?.success) {
      goToTab('preview');
    }
  };

  const handlePreview = (slot: keyof typeof uploadedFiles) => {
    previewSlot(slot);
    goToTab('preview');
  };

  const handleStartComparison = async () => {
    await startComparison(config);
  };

  const handleStop = async () => {
    await stopComparison();
  };

  return (
    <ThemeProvider theme={theme}>
      <div className={`flex h-screen w-screen overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-200 text-slate-900'}`}>
        <Sidebar
          uploadedFiles={uploadedFiles}
          config={config}
          onFileUpload={handleFileUpload}
          onConfigChange={setConfig}
          onStart={handleStartComparison}
          onPreview={handlePreview}
          appState={appState}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <Header
            onToggleTheme={toggleTheme}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            api={api}
          />

          <main className="flex-1 relative overflow-hidden">
            <MainPanel
              activeTab={activeTab}
              previewFile={previewFile}
              result={result}
              compilerStatus={compilerStatus}
              isRefreshingCompilers={isRefreshingCompilers}
              onRefreshCompilers={refreshCompilers}
              api={api}
            />
          </main>
        </div>

        {appState === 'RUNNING' && (
          <Overlay
            progress={progress}
            onStop={handleStop}
          />
        )}
      </div>
    </ThemeProvider>
  );
};

export default App;