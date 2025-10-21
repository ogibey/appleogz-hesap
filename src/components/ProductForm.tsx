import React, { useState } from 'react';
import { Product } from '../types';
import { generateProductCode, calculateNetProfit, getCurrentMonthYear } from '../utils/productUtils';
import { db } from '../utils/database';

interface ProductFormProps {
  onProductAdded: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    purchasePrice: '',
    cost: '',
    salePrice: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const purchasePrice = parseFloat(formData.purchasePrice);
      const cost = parseFloat(formData.cost);
      const salePrice = parseFloat(formData.salePrice);

      if (isNaN(purchasePrice) || isNaN(cost) || isNaN(salePrice)) {
        setMessage('Lütfen geçerli sayılar girin!');
        return;
      }

      const netProfit = calculateNetProfit(salePrice, purchasePrice, cost);
      const monthYear = getCurrentMonthYear();
      const code = generateProductCode(monthYear);

      const product: Omit<Product, 'id'> = {
        name: formData.name,
        purchasePrice,
        cost,
        salePrice,
        netProfit,
        code,
        isSold: false,
        createdAt: new Date(),
        monthYear
      };

      await db.products.add(product);
      
      setMessage(`Ürün başarıyla eklendi! Kod: ${code}`);
      setFormData({ name: '', purchasePrice: '', cost: '', salePrice: '' });
      onProductAdded();
    } catch (error) {
      setMessage('Hata oluştu: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="form-container">
      <h2>Yeni Ürün Ekle</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Ürünün Adı:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Örn: iPhone 15 Pro"
          />
        </div>

        <div className="form-group">
          <label>Alış Fiyatı (₺):</label>
          <input
            type="number"
            name="purchasePrice"
            value={formData.purchasePrice}
            onChange={handleChange}
            required
            step="0.01"
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label>Maliyet (₺):</label>
          <input
            type="number"
            name="cost"
            value={formData.cost}
            onChange={handleChange}
            required
            step="0.01"
            placeholder="Kargo + aksesuar"
          />
        </div>

        <div className="form-group">
          <label>Satış Fiyatı (₺):</label>
          <input
            type="number"
            name="salePrice"
            value={formData.salePrice}
            onChange={handleChange}
            required
            step="0.01"
            placeholder="0.00"
          />
        </div>

        {formData.salePrice && formData.purchasePrice && formData.cost && (
          <div className="profit-preview">
            <strong>Net Kar: ₺{calculateNetProfit(
              parseFloat(formData.salePrice) || 0,
              parseFloat(formData.purchasePrice) || 0,
              parseFloat(formData.cost) || 0
            ).toFixed(2)}</strong>
          </div>
        )}

        {message && (
          <div className={`message ${message.includes('başarıyla') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Ekleniyor...' : 'Ürün Ekle'}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
