import React, { useState } from 'react';
import { Product } from '../types';
import { generateProductCode, getCurrentMonthYear } from '../utils/productUtils';
import { db } from '../utils/database';

interface ProductFormProps {
  onProductAdded: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    purchasePrice: '',
    quantity: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const purchasePrice = parseFloat(formData.purchasePrice);
      const quantity = parseInt(formData.quantity);

      if (isNaN(purchasePrice) || isNaN(quantity) || quantity <= 0) {
        setMessage('Lütfen geçerli sayılar girin!');
        return;
      }

      const monthYear = getCurrentMonthYear();
      const code = generateProductCode(monthYear);

      const product: Omit<Product, 'id'> = {
        name: formData.name,
        purchasePrice,
        quantity,
        code,
        isSold: false,
        createdAt: new Date(),
        monthYear
      };

      await db.products.add(product);
      
      setMessage(`Ürün başarıyla eklendi! Kod: ${code}`);
      setFormData({ name: '', purchasePrice: '', quantity: '' });
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
          <label>Adet:</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            min="1"
            placeholder="1"
          />
        </div>


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
