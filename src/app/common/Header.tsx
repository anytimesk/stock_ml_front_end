'use client';

import { useState, useEffect } from 'react';

export default function Header() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // 다크 모드 토글 시 body에 dark 클래스 추가/제거
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    return (
        <header className="row-start-1 w-full h-15 flex flex-wrap items-center justify-center border border-gray-300">
            <div className="px-4 w-full">
                <div className="flex items-center justify-between">
                    <div>Stock Prediction</div>
                    <button 
                        onClick={() => setDarkMode(!darkMode)}
                        className={`px-3 py-1 rounded-md transition-colors ${
                            darkMode 
                                ? 'bg-neutral-50 text-neutral-950 hover:bg-neutral-400' 
                                : 'bg-neutral-950 text-neutral-50 hover:bg-neutral-400'
                        }`}
                    >
                        {darkMode ? 'Light' : 'Dark'}
                    </button>
                </div>
            </div>
        </header>
    )
}