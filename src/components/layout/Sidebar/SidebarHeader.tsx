import React from 'react';
import { useTheme } from '../../../hooks/useTheme';
import logo1 from '../../../assets/logos/logo1.png';
import logo2 from '../../../assets/logos/logo2.png';

const SidebarHeader: React.FC = () => {
    const { isDark } = useTheme();

    return (
        <div className="flex items-center gap-3">
            <img
                src={isDark ? logo2 : logo1}
                alt="AlgoCompare Logo"
                className="h-10 w-auto"
            />
            <span className={`text-base font-bold tracking-tight ${isDark ? 'text-neutral-200' : 'text-slate-900'}`}>
                AlgoCompare
            </span>
        </div>
    );
};

export default SidebarHeader;