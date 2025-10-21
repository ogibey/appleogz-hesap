import React, { useState, useEffect } from 'react';
import { Sale, DashboardStats } from '../types';
import { db } from '../utils/database';
import { getCurrentMonthYear } from '../utils/productUtils';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    soldProducts: 0,
    stockValue: 0,
    totalProfit: 0,
    monthlyProfit: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentSales, setRecentSales] = useState<Array<Sale & { productName: string }>>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Tüm ürünleri al
      const allProducts = await db.products.toArray();
      const allSales = await db.sales.toArray();
      
      const currentMonth = getCurrentMonthYear();
      
      // Stokta olan ürünler
      const stockProducts = allProducts.filter(p => !p.isSold);
      
      // Satılan ürünler
      const soldProducts = allProducts.filter(p => p.isSold);
      
      // Stok değeri (alış fiyatları toplamı)
      const stockValue = stockProducts.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0);
      
      // Borçları al (ayrı gösterim için)
      // const allDebts = await db.debts.toArray();
      
      // Toplam kar (satışlardan gelen net kar)
      const totalProfit = allSales.reduce((sum, sale) => sum + sale.netProfit, 0);
      
      // Aylık kar (bu ay yapılan satışlar)
      const currentMonthSales = allSales.filter(sale => {
        const saleDate = new Date(sale.saleDate);
        const saleMonth = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
        return saleMonth === currentMonth;
      });
      const monthlyProfit = currentMonthSales.reduce((sum, sale) => sum + sale.netProfit, 0);
      
      // Son satışları al (ürün adı ile birlikte)
      const recentSalesWithProductNames = await Promise.all(
        allSales.slice(-5).reverse().map(async (sale) => {
          const product = await db.products.get(sale.productId);
          return {
            ...sale,
            productName: product?.name || 'Bilinmeyen Ürün'
          };
        })
      );

      setStats({
        totalProducts: allProducts.length,
        soldProducts: soldProducts.length,
        stockValue: stockValue, // Gerçek stok değeri
        totalProfit,
        monthlyProfit
      });
      
      setRecentSales(recentSalesWithProductNames);
    } catch (error) {
      console.error('Dashboard verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Dashboard yükleniyor...</div>;
  }

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card primary">
          <h3>Toplam Ürün</h3>
          <div className="stat-value">{stats.totalProducts}</div>
        </div>
        
        <div className="stat-card success">
          <h3>Satılan Ürün</h3>
          <div className="stat-value">{stats.soldProducts}</div>
        </div>
        
        <div className="stat-card warning">
          <h3>Stokta Ürün</h3>
          <div className="stat-value">{stats.totalProducts - stats.soldProducts}</div>
        </div>
        
        <div className="stat-card info">
          <h3>Stok Değeri</h3>
          <div className="stat-value">₺{stats.stockValue.toFixed(2)}</div>
        </div>
        
        <div className="stat-card success">
          <h3>Toplam Kar</h3>
          <div className="stat-value">₺{stats.totalProfit.toFixed(2)}</div>
        </div>
        
        <div className="stat-card primary">
          <h3>Bu Ay Kar</h3>
          <div className="stat-value">₺{stats.monthlyProfit.toFixed(2)}</div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="recent-sales">
          <h3>Son Satışlar</h3>
          {recentSales.length === 0 ? (
            <p>Henüz satış yapılmamış</p>
          ) : (
            <div className="sales-list">
              {recentSales.map(sale => (
                <div key={sale.id} className="sale-item">
                  <div className="sale-info">
                    <strong>{sale.productName}</strong>
                    <span>₺{sale.salePrice}</span>
                  </div>
                  <div className="sale-details">
                    <span>{sale.customerName}</span>
                    <span>{new Date(sale.saleDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="quick-actions">
          <h3>Hızlı İşlemler</h3>
          <div className="action-buttons">
            <button onClick={() => window.location.reload()}>
              Verileri Yenile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
