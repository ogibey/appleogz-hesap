import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { db } from '../utils/database';

const ProductEdit: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    purchasePrice: '',
    quantity: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      purchasePrice: product.purchasePrice.toString(),
      quantity: product.quantity.toString()
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsSubmitting(true);
    setMessage('');

    try {
      const purchasePrice = parseFloat(formData.purchasePrice);
      const quantity = parseInt(formData.quantity);

      if (isNaN(purchasePrice) || isNaN(quantity) || quantity <= 0) {
        setMessage('Lütfen geçerli sayılar girin!');
        return;
      }

      await db.products.update(editingProduct.id!, {
        name: formData.name,
        purchasePrice,
        quantity
      });

      setMessage('Ürün başarıyla güncellendi!');
      setEditingProduct(null);
      setFormData({ name: '', purchasePrice: '', quantity: '' });
      loadProducts();
    } catch (error) {
      setMessage('Hata oluştu: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setFormData({ name: '', purchasePrice: '', quantity: '' });
    setMessage('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="product-edit-container">
      <h2>Ürün Düzenleme</h2>
      
      {editingProduct ? (
        <div className="edit-form">
          <h3>Ürün Düzenle: {editingProduct.name}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Ürün Adı:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ürün adı"
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

            <div className="form-actions">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Güncelleniyor...' : 'Güncelle'}
              </button>
              <button type="button" onClick={handleCancel}>
                İptal
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="products-list">
          <h3>Düzenlenecek Ürünü Seçin</h3>
          {products.length === 0 ? (
            <div className="no-products">
              <p>Henüz ürün eklenmemiş</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-header">
                    <h4>{product.name}</h4>
                    <span className={`status ${product.isSold ? 'sold' : 'available'}`}>
                      {product.isSold ? 'Satıldı' : 'Stokta'}
                    </span>
                  </div>
                  <div className="product-details">
                    <p><strong>Kod:</strong> {product.code}</p>
                    <p><strong>Alış:</strong> ₺{product.purchasePrice}</p>
                    <p><strong>Adet:</strong> {product.quantity}</p>
                    <p><strong>Ay:</strong> {product.monthYear}</p>
                  </div>
                  <button 
                    onClick={() => handleEdit(product)}
                    className="edit-button"
                    disabled={product.isSold}
                  >
                    {product.isSold ? 'Satıldı' : 'Düzenle'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductEdit;
