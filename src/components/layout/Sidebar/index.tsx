import React from 'react';
import { Settings, FileUp } from 'lucide-react';
import { AppMode, UploadedFiles, Config } from '../../../types';
import { useTheme } from '../../../hooks/useTheme';
import SlotCard from './SlotCard';
import SettingsPanel from './SettingsPanel';
import SidebarHeader from './SidebarHeader';
import LaunchButton from './LaunchButton';

interface SidebarProps {
    uploadedFiles: UploadedFiles;
    config: Config;
    onFileUpload: (slot: keyof UploadedFiles) => void;
    onConfigChange: (config: Config) => void;
    onStart: () => void;
    onPreview: (slot: keyof UploadedFiles) => void;
    appState: AppMode;
}

const Sidebar: React.FC<SidebarProps> = ({
    uploadedFiles,
    config,
    onFileUpload,
    onConfigChange,
    onStart,
    onPreview,
    appState,
}) => {
    const { isDark } = useTheme();

    return (
        <aside className={`w-[340px] h-full border-r flex flex-col overflow-hidden transition-colors duration-300 ${isDark ? 'bg-neutral-950 border-neutral-800/50' : 'bg-slate-100 border-slate-300'
            }`}>
            <div className="h-16 flex items-center px-8 drag-region">
                <SidebarHeader />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-2 gap-10 flex flex-col">

                <section>
                    <div className="flex items-center justify-between mb-6 px-1">
                        <span className={`text-xs font-bold uppercase tracking-[0.15em] ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>
                            Input Files
                        </span>
                        <FileUp size={20} className={isDark ? 'text-neutral-500' : 'text-slate-500'} />
                    </div>

                    <div className="space-y-4">
                        <SlotCard
                            label="Untested Solution"
                            file={uploadedFiles.testedSolution}
                            onUpload={() => onFileUpload('testedSolution')}
                            onPreview={() => onPreview('testedSolution')}
                            acceptedExtensions={['.cpp', '.py', '.java']}
                        />
                        <SlotCard
                            label="Brute Force Solution"
                            file={uploadedFiles.bruteForce}
                            onUpload={() => onFileUpload('bruteForce')}
                            onPreview={() => onPreview('bruteForce')}
                            acceptedExtensions={['.cpp', '.py', '.java']}
                        />
                        <SlotCard
                            label="Data File"
                            file={uploadedFiles.testCases}
                            onUpload={() => onFileUpload('testCases')}
                            onPreview={() => onPreview('testCases')}
                            acceptedExtensions={['.txt', '.java', '.py', '.cpp']}
                        />
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="flex items-center justify-between px-1 mb-2">
                        <span className={`text-xs font-bold uppercase tracking-[0.15em] ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>
                            Settings
                        </span>
                        <Settings size={20} className={isDark ? 'text-neutral-500' : 'text-slate-500'} />
                    </div>

                    <div className="space-y-5">
                        <SettingsPanel config={config} onConfigChange={onConfigChange} />
                    </div>
                </section>

                <div className={`mt-auto pt-8 border-t ${isDark ? 'border-neutral-800/50' : 'border-slate-300'}`}>
                    <LaunchButton appState={appState} onStart={onStart} />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;