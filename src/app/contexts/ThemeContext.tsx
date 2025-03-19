'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// 테마별 CSS 변수 값 정의
const themeValues = {
  light: {
    background: '#fafafa',
    foreground: '#0a0a0a',
    cardBackground: '#ffffff',
    borderColor: '#e5e7eb', // gray-200
    shadowColor: 'rgba(0, 0, 0, 0.1)'
  },
  dark: {
    background: '#0a0a0a',
    foreground: '#fafafa',
    cardBackground: '#111827', // gray-900
    borderColor: '#374151', // gray-700
    shadowColor: 'rgba(0, 0, 0, 0.5)'
  }
};

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  themeValues: typeof themeValues.light;
}

// Context 생성
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider 컴포넌트
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // CSS 변수 적용 함수
  const applyTheme = (mode: 'light' | 'dark') => {
    const root = document.documentElement;
    const values = themeValues[mode];
    
    // CSS 변수 설정
    Object.entries(values).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    
    // 다크 모드 클래스 설정
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // 초기 상태 설정 (localStorage와 시스템 설정 확인)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(initialDarkMode);
    
    // 초기 테마 적용
    applyTheme(initialDarkMode ? 'dark' : 'light');
  }, []);

  // 테마 전환 함수
  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      const themeName = newMode ? 'dark' : 'light';
      
      // 테마 적용
      applyTheme(themeName);
      
      // localStorage에 저장
      localStorage.setItem('theme', themeName);
      
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ 
      isDarkMode, 
      toggleTheme,
      themeValues: isDarkMode ? themeValues.dark : themeValues.light 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 커스텀 훅으로 컨텍스트 사용 간편화
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 