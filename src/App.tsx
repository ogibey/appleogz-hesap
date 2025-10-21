import React, { useState } from 'react';
import PasswordGate from './components/PasswordGate';
import Dashboard from './components/Dashboard';
import ProductForm from './components/ProductForm';
import SaleForm from './components/SaleForm';
import StockList from './components/StockList';
import MonthlyRollover from './components/MonthlyRollover';
import BackupRestore from './components/BackupRestore';
import './App.css';

type Page = 'dashboard' | 'add-product' | 'sale' | 'stock' | 'rollover' | 'backup';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'add-product':
        return <ProductForm onProductAdded={() => setCurrentPage('stock')} />;
      case 'sale':
        return <SaleForm onSaleCompleted={() => setCurrentPage('dashboard')} />;
      case 'stock':
        return <StockList />;
      case 'rollover':
        return <MonthlyRollover />;
      case 'backup':
        return <BackupRestore />;
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return <PasswordGate onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>AppleOGZ Hesap</h1>
        <button onClick={handleLogout} className="logout-button">
          Çıkış
        </button>
      </header>

      <nav className="app-nav">
        <button 
          className={currentPage === 'dashboard' ? 'active' : ''}
          onClick={() => setCurrentPage('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={currentPage === 'add-product' ? 'active' : ''}
          onClick={() => setCurrentPage('add-product')}
        >
          ➕ Ürün Ekle
        </button>
        <button 
          className={currentPage === 'sale' ? 'active' : ''}
          onClick={() => setCurrentPage('sale')}
        >
          💰 Satış Yap
        </button>
        <button 
          className={currentPage === 'stock' ? 'active' : ''}
          onClick={() => setCurrentPage('stock')}
        >
          📦 Stok
        </button>
        <button 
          className={currentPage === 'rollover' ? 'active' : ''}
          onClick={() => setCurrentPage('rollover')}
        >
          🔄 Aylık Devir
        </button>
        <button 
          className={currentPage === 'backup' ? 'active' : ''}
          onClick={() => setCurrentPage('backup')}
        >
          💾 Yedekleme
        </button>
      </nav>

      <main className="app-main">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
