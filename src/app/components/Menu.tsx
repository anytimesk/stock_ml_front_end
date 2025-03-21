'use client';

import { useTheme } from '../contexts/ThemeContext';

interface MenuProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export default function Menu({ activeTab, onTabChange }: MenuProps) {
    const { isDarkMode } = useTheme();
    
    return (
        <header className="w-full px-4 py-3 border-b">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center">
                    <nav className="flex space-x-2">
                        <button 
                            onClick={() => onTabChange('search')}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                activeTab === 'search' 
                                    ? isDarkMode 
                                        ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : isDarkMode
                                        ? 'text-indigo-200 hover:bg-indigo-900 hover:text-indigo-100' 
                                        : 'text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800'
                            }`}
                        >
                            조회
                        </button>
                        <button 
                            onClick={() => onTabChange('learning')}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                activeTab === 'learning' 
                                    ? isDarkMode 
                                        ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : isDarkMode
                                        ? 'text-indigo-200 hover:bg-indigo-900 hover:text-indigo-100' 
                                        : 'text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800'
                            }`}
                        >
                            학습
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    );
} 