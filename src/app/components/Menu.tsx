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
                                        ? 'bg-teal-500 text-white hover:bg-teal-400' 
                                        : 'bg-teal-600 text-white hover:bg-teal-700'
                                    : isDarkMode
                                        ? 'text-teal-200 hover:bg-teal-900 hover:text-teal-100' 
                                        : 'text-teal-700 hover:bg-teal-50 hover:text-teal-800'
                            }`}
                        >
                            조회
                        </button>
                        <button 
                            onClick={() => onTabChange('learning')}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                activeTab === 'learning' 
                                    ? isDarkMode 
                                        ? 'bg-teal-500 text-white hover:bg-teal-400' 
                                        : 'bg-teal-600 text-white hover:bg-teal-700'
                                    : isDarkMode
                                        ? 'text-teal-200 hover:bg-teal-900 hover:text-teal-100' 
                                        : 'text-teal-700 hover:bg-teal-50 hover:text-teal-800'
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