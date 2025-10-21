import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { db } from '../utils/database';

const StockList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sold' | 'unsold'>('all');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const allProducts = await db.products.orderBy('createdAt').reverse().toArray();
      setProducts(allProducts);
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    if (filter === 'sold') return product.isSold;
    if (filter === 'unsold') return !product.isSold;
    return true;
  });

  const totalStockValue = products
    .filter(p => !p.isSold)
    .reduce((sum, p) => sum + p.purchasePrice, 0);

  const totalProfit = products
    .filter(p => p.isSold)
    .reduce((sum, p) => sum + p.netProfit, 0);

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="stock-container">
      <div className="stock-header">
        <h2>Stok Durumu</h2>
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            Tümü
          </button>
          <button 
            className={filter === 'unsold' ? 'active' : ''} 
            onClick={() => setFilter('unsold')}
          >
            Stokta
          </button>
          <button 
            className={filter === 'sold' ? 'active' : ''} 
            onClick={() => setFilter('sold')}
          >
            Satılan
          </button>
        </div>
      </div>

      <div className="stock-stats">
        <div className="stat-card">
          <h3>Toplam Ürün</h3>
          <p>{products.length}</p>
        </div>
        <div className="stat-card">
          <h3>Stokta</h3>
          <p>{products.filter(p => !p.isSold).length}</p>
        </div>
        <div className="stat-card">
          <h3>Satılan</h3>
          <p>{products.filter(p => p.isSold).length}</p>
        </div>
        <div className="stat-card">
          <h3>Stok Değeri</h3>
          <p>₺{totalStockValue.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Toplam Kar</h3>
          <p>₺{totalProfit.toFixed(2)}</p>
        </div>
      </div>

      <div className="products-list">
        {filteredProducts.length === 0 ? (
          <div className="no-products">
            {filter === 'all' ? 'Henüz ürün eklenmemiş' : 
             filter === 'sold' ? 'Henüz satış yapılmamış' : 
             'Stokta ürün yok'}
          </div>
        ) : (
          filteredProducts.map(product => (
            <div key={product.id} className={`product-card ${product.isSold ? 'sold' : 'available'}`}>
              <div className="product-header">
                <h3>{product.name}</h3>
                <span className={`status ${product.isSold ? 'sold' : 'available'}`}>
                  {product.isSold ? 'Satıldı' : 'Stokta'}
                </span>
              </div>
              <div className="product-details">
                <p><strong>Kod:</strong> {product.code}</p>
                <p><strong>Alış:</strong> ₺{product.purchasePrice}</p>
                <p><strong>Maliyet:</strong> ₺{product.cost}</p>
                <p><strong>Satış:</strong> ₺{product.salePrice}</p>
                <p><strong>Net Kar:</strong> ₺{product.netProfit}</p>
                <p><strong>Ay:</strong> {product.monthYear}</p>
                <p><strong>Eklenme:</strong> {new Date(product.createdAt).toLocaleDateString('tr-TR')}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StockList;
