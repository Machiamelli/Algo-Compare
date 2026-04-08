import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Layers, Check } from 'lucide-react';

interface CustomDropdownProps {
    isDark: boolean;
    selected: 'static' | 'generator';
    onSelect: (value: 'static' | 'generator') => void;
}

const Dropdown: React.FC<CustomDropdownProps> = ({ isDark, selected, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);

    const options = [
        { id: 'static', label: 'Text File', description: 'Static test cases from file' },
        { id: 'generator', label: 'Generator Code', description: 'Generate test cases dynamically' },
    ];

    const handleSelect = (optionId: 'static' | 'generator') => {
        onSelect(optionId);
        setIsOpen(false);
    };

    const selectedOption = options.find(opt => opt.id === selected);

    return (
        <div className="relative">
            {/* Dropdown Button */}
            <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 flex items-center justify-between group ${isDark
                    ? 'bg-black/60 border-neutral-800 text-white hover:bg-neutral-900'
                    : 'bg-white border-slate-300 text-slate-900 hover:bg-slate-50'
                    }`}
            >
                <div className="flex items-center">
                    <Layers size={18} className={isDark ? 'text-neutral-500 mr-3' : 'text-slate-500 mr-3'} />
                    <span className="font-semibold text-sm">{selectedOption?.label || 'Select mode'}</span>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronDown className="w-5 h-5" />
                </motion.div>
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute w-full mt-2 rounded-lg border overflow-hidden shadow-2xl z-10 ${isDark
                            ? 'bg-neutral-950 border-neutral-800'
                            : 'bg-white border-slate-300'
                            }`}
                    >
                        {options.map((option, index) => (
                            <motion.button
                                key={option.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                onClick={() => handleSelect(option.id as 'static' | 'generator')}
                                className={`w-full px-4 py-3 text-left transition-colors duration-200 flex items-center justify-between group ${isDark
                                    ? 'hover:bg-neutral-900 text-white'
                                    : 'hover:bg-slate-100 text-slate-900'
                                    } ${index !== options.length - 1
                                        ? isDark
                                            ? 'border-b border-neutral-800'
                                            : 'border-b border-slate-200'
                                        : ''
                                    }`}
                            >
                                <div>
                                    <div className="font-medium text-sm">{option.label}</div>
                                    <div className={`text-xs ${isDark ? 'text-neutral-500 group-hover:text-neutral-300' : 'text-slate-600 group-hover:text-slate-700'
                                        }`}>
                                        {option.description}
                                    </div>
                                </div>
                                {selected === option.id && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    >
                                        <Check className="w-5 h-5" />
                                    </motion.div>
                                )}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dropdown;
