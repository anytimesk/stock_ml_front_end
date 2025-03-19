'use client';

import { useTheme } from '../contexts/ThemeContext';

export default function Header() {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <header 
            className="row-start-1 w-full h-15 flex flex-wrap items-center justify-center border" 
            style={{ borderColor: 'var(--borderColor)' }}
        >
            <div className="px-4 w-full">
                <div className="flex items-center justify-between">
                    <div>Stock Prediction</div>
                    <button 
                        onClick={toggleTheme}
                        className={`px-3 py-1 rounded-md transition-colors ${
                            isDarkMode 
                                ? 'bg-neutral-50 text-neutral-950 hover:bg-neutral-400' 
                                : 'bg-neutral-950 text-neutral-50 hover:bg-neutral-400'
                        }`}
                    >
                        {isDarkMode ? 'Light' : 'Dark'}
                    </button>
                </div>
            </div>
        </header>
    )
}