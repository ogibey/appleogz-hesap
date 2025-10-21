import React, { useState, useEffect } from 'react';
import { Product, Sale } from '../types';
import { db } from '../utils/database';

interface SaleFormProps {
  onSaleCompleted: () => void;
}

const SaleForm: React.FC<SaleFormProps> = ({ onSaleCompleted }) => {
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [formData, setFormData] = useState({
    customerName: '',
    imei: '',
    saleDate: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAvailableProducts();
  }, []);

  const loadAvailableProducts = async () => {
    try {
      const products = await db.products.where('isSold').equals(0).toArray();
      setAvailableProducts(products);
    } catch (error) {
      setMessage('Ürünler yüklenirken hata oluştu!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      if (!selectedProductId) {
        setMessage('Lütfen bir ürün seçin!');
        return;
      }

      const product = availableProducts.find(p => p.id === selectedProductId);
      if (!product) {
        setMessage('Seçilen ürün bulunamadı!');
        return;
      }

      const sale: Omit<Sale, 'id'> = {
        productId: selectedProductId as number,
        customerName: formData.customerName,
        saleDate: new Date(formData.saleDate),
        imei: formData.imei,
        salePrice: product.salePrice,
        createdAt: new Date()
      };

      // Satış kaydını ekle
      await db.sales.add(sale);

      // Ürünü satıldı olarak işaretle
      await db.products.update(selectedProductId, { isSold: true });

      setMessage(`Satış başarıyla tamamlandı! Müşteri: ${formData.customerName}`);
      setFormData({ customerName: '', imei: '', saleDate: new Date().toISOString().split('T')[0] });
      setSelectedProductId('');
      
      // Stok listesini yenile
      loadAvailableProducts();
      onSaleCompleted();
    } catch (error) {
      setMessage('Hata oluştu: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectedProduct = availableProducts.find(p => p.id === selectedProductId);

  return (
    <div className="form-container">
      <h2>Satış Yap</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Ürün Seç:</label>
          <select
            name="productId"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(Number(e.target.value) || '')}
            required
          >
            <option value="">Ürün seçin...</option>
            {availableProducts.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} - {product.code} (₺{product.salePrice})
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <div className="product-info">
            <h3>Seçilen Ürün:</h3>
            <p><strong>Ad:</strong> {selectedProduct.name}</p>
            <p><strong>Kod:</strong> {selectedProduct.code}</p>
            <p><strong>Satış Fiyatı:</strong> ₺{selectedProduct.salePrice}</p>
            <p><strong>Net Kar:</strong> ₺{selectedProduct.netProfit}</p>
          </div>
        )}

        <div className="form-group">
          <label>Müşteri Adı:</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            required
            placeholder="Müşteri adı soyadı"
          />
        </div>

        <div className="form-group">
          <label>IMEI:</label>
          <input
            type="text"
            name="imei"
            value={formData.imei}
            onChange={handleChange}
            required
            placeholder="15 haneli IMEI numarası"
          />
        </div>

        <div className="form-group">
          <label>Satış Tarihi:</label>
          <input
            type="date"
            name="saleDate"
            value={formData.saleDate}
            onChange={handleChange}
            required
          />
        </div>

        {message && (
          <div className={`message ${message.includes('başarıyla') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <button type="submit" disabled={isSubmitting || !selectedProductId}>
          {isSubmitting ? 'Satış yapılıyor...' : 'Satışı Tamamla'}
        </button>
      </form>
    </div>
  );
};

export default SaleForm;
