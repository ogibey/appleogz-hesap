import React, { useState, useEffect } from 'react';
import { Product, MonthlyData } from '../types';
import { db } from '../utils/database';
import { getCurrentMonthYear, getNextMonthYear } from '../utils/productUtils';

const MonthlyRollover: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState('');
  const [nextMonth, setNextMonth] = useState('');
  const [unsoldProducts, setUnsoldProducts] = useState<Product[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [lastRolloverDate, setLastRolloverDate] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const current = getCurrentMonthYear();
      const next = getNextMonthYear(current);
      setCurrentMonth(current);
      setNextMonth(next);

      // Satılmamış ürünleri al
      const allProducts = await db.products.toArray();
      const unsold = allProducts.filter(p => !p.isSold);
      setUnsoldProducts(unsold);

      // Son devir tarihini kontrol et
      const lastRollover = localStorage.getItem('lastRolloverDate');
      setLastRolloverDate(lastRollover);
    } catch (error) {
      setMessage('Veriler yüklenirken hata oluştu!');
    }
  };

  const handleRollover = async () => {
    if (unsoldProducts.length === 0) {
      setMessage('Devredilecek ürün bulunmuyor!');
      return;
    }

    if (!confirm(`${unsoldProducts.length} adet satılmamış ürünü ${nextMonth} ayına devretmek istediğinizden emin misiniz?`)) {
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
      // Yeni ay verisini oluştur
      const monthlyData: Omit<MonthlyData, 'id'> = {
        monthYear: nextMonth,
        isActive: true,
        createdAt: new Date()
      };
      await db.monthlyData.add(monthlyData);

      // Mevcut ayı pasif yap
      const currentMonthData = await db.monthlyData.where('monthYear').equals(currentMonth).first();
      if (currentMonthData && currentMonthData.id) {
        await db.monthlyData.update(currentMonthData.id, { isActive: false });
      }

      // Satılmamış ürünleri yeni aya devret
      const updatePromises = unsoldProducts.map(product => 
        db.products.update(product.id!, { monthYear: nextMonth })
      );
      await Promise.all(updatePromises);

      // Son devir tarihini kaydet
      const now = new Date().toISOString();
      localStorage.setItem('lastRolloverDate', now);
      setLastRolloverDate(now);

      setMessage(`Başarıyla ${unsoldProducts.length} ürün ${nextMonth} ayına devredildi!`);
      
      // Verileri yenile
      loadData();
    } catch (error) {
      setMessage('Devir işlemi sırasında hata oluştu: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  return (
    <div className="rollover-container">
      <h2>Aylık Devir</h2>
      
      <div className="rollover-info">
        <div className="info-card">
          <h3>Mevcut Ay</h3>
          <p>{currentMonth}</p>
        </div>
        
        <div className="info-card">
          <h3>Hedef Ay</h3>
          <p>{nextMonth}</p>
        </div>
        
        <div className="info-card">
          <h3>Devredilecek Ürün</h3>
          <p>{unsoldProducts.length} adet</p>
        </div>
      </div>

      {lastRolloverDate && (
        <div className="last-rollover">
          <p><strong>Son Devir:</strong> {formatDate(lastRolloverDate)}</p>
        </div>
      )}

      {unsoldProducts.length > 0 && (
        <div className="unsold-products">
          <h3>Devredilecek Ürünler:</h3>
          <div className="products-preview">
            {unsoldProducts.slice(0, 5).map(product => (
              <div key={product.id} className="product-preview">
                <span>{product.name}</span>
                <span>{product.code}</span>
                <span>₺{product.purchasePrice}</span>
              </div>
            ))}
            {unsoldProducts.length > 5 && (
              <p>... ve {unsoldProducts.length - 5} ürün daha</p>
            )}
          </div>
        </div>
      )}

      {message && (
        <div className={`message ${message.includes('Başarıyla') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <button 
        onClick={handleRollover}
        disabled={isProcessing || unsoldProducts.length === 0}
        className="rollover-button"
      >
        {isProcessing ? 'Devir yapılıyor...' : 
         unsoldProducts.length === 0 ? 'Devredilecek ürün yok' : 
         `${unsoldProducts.length} Ürünü Devret`}
      </button>

      <div className="rollover-note">
        <p><strong>Not:</strong> Bu işlem geri alınamaz. Devir yapmadan önce tüm verilerinizin yedeğini aldığınızdan emin olun.</p>
      </div>
    </div>
  );
};

export default MonthlyRollover;
