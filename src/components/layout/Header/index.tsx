import React from 'react';
import { Terminal, Code2, Activity, Sun, Moon, Minus, Square, X, Copy } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
// logos removed: header no longer shows project logo

interface HeaderProps {
  onToggleTheme: () => void;
  activeTab: 'preview' | 'results' | 'status';
  setActiveTab: (tab: 'preview' | 'results' | 'status') => void;
  api: any;
}

const Header: React.FC<HeaderProps> = ({ onToggleTheme, activeTab, setActiveTab, api }) => {
  const { isDark } = useTheme();
  const [isMaximized, setIsMaximized] = React.useState(false);

  React.useEffect(() => {
    api?.onMaximizedStatus((status: boolean) => {
      setIsMaximized(status);
    });

    return () => {
      api?.removeMaximizedStatusListener?.();
    };
  }, [api]);

  return (
    <header className={`h-16 border-b flex items-center justify-between pl-8 pr-4 drag-region transition-colors duration-300 ${isDark ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-6 h-full">
        <nav className="flex items-center h-full gap-2 no-drag">
          <NavItem
            active={activeTab === 'preview'}
            onClick={() => setActiveTab('preview')}
            label="Editor"
            icon={<Code2 size={16} />}
          />
          <NavItem
            active={activeTab === 'results'}
            onClick={() => setActiveTab('results')}
            label="Analysis"
            icon={<Activity size={16} />}
          />
          <NavItem
            active={activeTab === 'status'}
            onClick={() => setActiveTab('status')}
            label="Environment"
            icon={<Terminal size={16} />}
          />
        </nav>
      </div>

      <div className="flex items-center h-full no-drag ml-auto">
        <button
          onClick={onToggleTheme}
          className={`p-2 mx-2 rounded-lg transition-all ${isDark ? 'text-zinc-500 hover:text-white hover:bg-zinc-900' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'}`}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className={`w-px h-8 mx-2 ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`} />

        <div className="flex items-center h-full">
          <WindowBtn
            icon={<Minus size={16} />}
            onClick={() => api?.minimizeWindow()}
          />
          <WindowBtn
            icon={isMaximized ? <Copy size={14} className="rotate-90" /> : <Square size={14} />}
            onClick={() => api?.maximizeWindow()}
          />
          <WindowBtn
            icon={<X size={16} />}
            variant="close"
            onClick={() => api?.closeWindow()}
          />
        </div>
      </div>
    </header>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; label: string; icon: React.ReactNode; disabled?: boolean }> = ({ active, onClick, label, icon, disabled }) => {
  const { isDark } = useTheme();
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-full px-5 flex items-center gap-2.5 text-sm font-semibold transition-all relative border-b-2 ${disabled ? 'opacity-20 cursor-not-allowed border-transparent' :
        active
          ? (isDark ? 'text-white border-white bg-white/5' : 'text-slate-900 border-slate-900 bg-slate-900/5')
          : (isDark ? 'text-zinc-500 border-transparent hover:text-white hover:bg-zinc-900' : 'text-slate-400 border-transparent hover:text-slate-900 hover:bg-slate-50')
        }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

const WindowBtn: React.FC<{ icon: React.ReactNode; variant?: 'close'; onClick?: () => void }> = ({ icon, variant, onClick }) => {
  const { isDark } = useTheme();
  return (
    <button
      onClick={onClick}
      className={`w-12 h-full flex items-center justify-center transition-colors ${variant === 'close'
        ? (isDark ? 'hover:bg-red-900/30 hover:text-red-500' : 'hover:bg-red-50 hover:text-red-600')
        : (isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-200 text-slate-500')
        }`}>
      {icon}
    </button>
  );
}

export default Header;