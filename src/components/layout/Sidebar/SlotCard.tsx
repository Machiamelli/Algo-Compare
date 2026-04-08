import React, { useState } from 'react';
import { Plus, Check, Eye, Loader2 } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';

interface SlotCardProps {
    label: string;
    file: any;
    onUpload: () => void;
    onPreview: () => void;
    acceptedExtensions: string[];
}

const SlotCard: React.FC<SlotCardProps> = ({
    label,
    file,
    onUpload,
    onPreview,
    acceptedExtensions
}) => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { isDark } = useTheme();

    const handleClick = async () => {
        if (loading) return;
        setLoading(true);
        try {
            await onUpload();
            setError(null);
        } catch (err: any) {
            if (err?.message && err.message !== 'cancelled') {
                setError(err.message);
                setTimeout(() => setError(null), 3000);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`group cursor-pointer rounded-xl border px-5 py-4 transition-all duration-200 relative overflow-hidden ${file
                ? (isDark ? 'bg-neutral-900 border-neutral-600 ring-1 ring-neutral-700/50' : 'bg-white border-slate-900 shadow-md ring-1 ring-slate-900/5')
                : (isDark ? 'bg-neutral-900/40 border-neutral-800 border-dashed hover:border-neutral-600 hover:bg-neutral-900' : 'bg-slate-200 border-slate-300 border-dashed hover:border-slate-400 hover:bg-white')
                } ${error ? 'border-red-500 ring-1 ring-red-500' : ''}`}
        >
            {error && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-red-500/90 backdrop-blur-sm p-4 text-center">
                    <p className="text-white text-xs font-bold">{error}</p>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="min-w-0 pr-4">
                    <p className={`text-[10px] font-bold uppercase mb-1 tracking-widest ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>
                        {label}
                    </p>
                    <h3 className={`text-sm font-bold truncate ${file ? (isDark ? 'text-neutral-200' : 'text-slate-900') : (isDark ? 'text-neutral-600' : 'text-slate-500')}`}>
                        {file ? file.fileName : 'Unassigned'}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    {file && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                onPreview();
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 ${isDark ? 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200' : 'bg-slate-300 text-slate-600 hover:bg-slate-400 hover:text-white'
                                }`}
                        >
                            <Eye size={16} />
                        </div>
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${file
                        ? (isDark ? 'bg-neutral-700 text-neutral-200' : 'bg-black text-white')
                        : (isDark ? 'bg-neutral-800 text-neutral-500' : 'bg-slate-300 text-slate-400 group-hover:scale-110')
                        }`}>
                        {loading ? <Loader2 size={16} className="animate-spin" /> : file ? <Check size={16} /> : <Plus size={16} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SlotCard;