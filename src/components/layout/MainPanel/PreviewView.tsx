import React, { useState, useEffect, useCallback } from 'react';
import { FileCode2, Search, Save, CheckCircle } from 'lucide-react';
import { FileData, UploadedFiles } from '../../../types';
import { useTheme } from '../../../hooks/useTheme';
import CopyButton from '../../ui/CopyButton';
import CodeEditor from '../../ui/CodeEditor';
import { fileService } from '../../../services/fileService';

interface PreviewViewProps {
    previewFile: { slot: keyof UploadedFiles; data: FileData } | null;
    api: any;
}

const PreviewView: React.FC<PreviewViewProps> = ({ previewFile, api }) => {
    const [fileContent, setFileContent] = useState<string>('');
    const [editedContent, setEditedContent] = useState<string>('');
    const [isDirty, setIsDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveFlash, setSaveFlash] = useState(false);
    const { isDark } = useTheme();

    // Load file content when preview file changes
    useEffect(() => {
        if (previewFile && api) {
            api.readFile(previewFile.data.path).then((res: { success: boolean; data?: string; error?: string }) => {
                const content = res.success && typeof res.data === 'string' ? res.data : '';
                setFileContent(content);
                setEditedContent(content);
                setIsDirty(false);
            });
        }
    }, [previewFile, api]);

    const handleEditorChange = useCallback((newContent: string) => {
        setEditedContent(newContent);
        setIsDirty(newContent !== fileContent);
    }, [fileContent]);

    const handleSave = useCallback(async () => {
        if (!previewFile || !isDirty || saving) return;

        setSaving(true);
        try {
            const result = await fileService.saveEditedFile(
                previewFile.data.path,
                editedContent,
            );
            if (result.success) {
                setFileContent(editedContent);
                setIsDirty(false);
                setSaveFlash(true);
                setTimeout(() => setSaveFlash(false), 1500);
            }
        } catch (err) {
            console.error('Failed to save:', err);
        } finally {
            setSaving(false);
        }
    }, [previewFile, isDirty, saving, editedContent]);

    // Ctrl+S keyboard shortcut
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleSave]);

    if (!previewFile) {
        return (
            <div
                className={`h-full flex flex-col items-center justify-center transition-colors duration-300 ${isDark ? 'bg-zinc-950 text-zinc-800' : 'bg-slate-200 text-slate-400'
                    }`}
            >
                <Search size={64} strokeWidth={1.5} />
                <p
                    className={`text-sm font-bold mt-6 tracking-[0.2em] uppercase ${isDark ? 'text-zinc-700' : 'text-slate-500'
                        }`}
                >
                    Standby - No File Selected
                </p>
            </div>
        );
    }

    return (
        <div
            className={`h-full flex flex-col transition-colors duration-300 ${isDark ? 'bg-zinc-950' : 'bg-slate-200'
                }`}
        >
            {/* Toolbar */}
            <div
                className={`h-12 border-b flex items-center justify-between px-8 shrink-0 ${isDark ? 'border-zinc-900 bg-zinc-900/20' : 'border-slate-300 bg-white'
                    }`}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <FileCode2 size={16} className={isDark ? 'text-zinc-500' : 'text-slate-500'} />
                    <span
                        className={`text-xs font-semibold font-mono tracking-tight truncate ${isDark ? 'text-zinc-400' : 'text-slate-600'
                            }`}
                    >
                        {previewFile.data.fileName}
                    </span>
                    {isDirty && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
                    )}
                    {saveFlash && (
                        <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold shrink-0">
                            <CheckCircle size={12} /> Saved
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {isDirty && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isDark
                                ? 'bg-white text-black hover:bg-zinc-200'
                                : 'bg-slate-900 text-white hover:bg-slate-700'
                                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Save size={12} />
                            {saving ? 'SAVING...' : 'SAVE'}
                        </button>
                    )}
                    <CopyButton content={editedContent || fileContent} label="COPY CODE" />
                </div>
            </div>

            {/* Editor */}
            <div
                className={`flex-1 overflow-hidden m-4 rounded-xl shadow-md border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-300/50'
                    }`}
            >
                <CodeEditor
                    content={fileContent}
                    language={previewFile.data.language}
                    theme={isDark ? 'dark' : 'light'}
                    onChange={handleEditorChange}
                />
            </div>
        </div>
    );
};

export default PreviewView;