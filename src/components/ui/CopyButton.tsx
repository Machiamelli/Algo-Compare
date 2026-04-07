import React, { useState } from 'react';
import { CheckCircle2, Copy } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface CopyButtonProps {
    content: string;
    label?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ content, label = 'Copy' }) => {
    const [copied, setCopied] = useState(false);
    const { isDark } = useTheme();

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 500);
    };

    return (
        <button
            onClick={handleCopy}
            className={`flex items-center gap-2 text-[10px] font-bold uppercase transition-colors ${copied
                ? 'text-emerald-500'
                : isDark
                    ? 'text-zinc-500 hover:text-white'
                    : 'text-slate-400 hover:text-slate-900'
                }`}
        >
            {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
            {copied ? 'COPIED' : label}
        </button>
    );
};

export default CopyButton;
