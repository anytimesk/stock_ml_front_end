'use client';

import { useState } from 'react';
import Menu from './components/Menu';
import SearchStock from './components/SearchStock';
import MachineLearning from './components/MachineLearning';

export default function Home() {
  const [activeTab, setActiveTab] = useState('search');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start">
      <Menu activeTab={activeTab} onTabChange={handleTabChange} />
      
      <div className="container mx-auto px-4 py-8 w-full">
        {activeTab === 'search' && <SearchStock />}
        {activeTab === 'learning' && <MachineLearning />}
      </div>
    </main>
  );
}
