import React, { useState } from 'react';
import { CryptexLanding } from './CryptexLanding';
import { CryptexRegister } from './CryptexRegister';
import { CryptexLogin } from './CryptexLogin';
import { CryptexDashboard } from './CryptexDashboard';
import { CryptexBlockchain } from './CryptexBlockchain';

export function CryptexApp() {
  const [currentPage, setCurrentPage] = useState<string>('landing');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'register':
        return <CryptexRegister onNavigate={handleNavigate} />;
      case 'login':
        return <CryptexLogin onNavigate={handleNavigate} />;
      case 'dashboard':
        return <CryptexDashboard onNavigate={handleNavigate} />;
      case 'blockchain':
        return <CryptexBlockchain onNavigate={handleNavigate} />;
      default:
        return <CryptexLanding onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderCurrentPage()}
    </div>
  );
}