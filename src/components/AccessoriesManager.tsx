import React, { useState, useEffect } from 'react';
import { Accessory } from '../types';
import { db } from '../utils/database';

const AccessoriesManager: React.FC = () => {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    type: 'kılıf' as 'kılıf' | 'ekran koruyucu' | 'kablo',
    quantity: '',
    price: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [editingAccessory, setEditingAccessory] = useState<Accessory | null>(null);

  useEffect(() => {
    loadAccessories();
  }, []);

  const loadAccessories = async () => {
    try {
      setLoading(true);
      const allAccessories = await db.accessories.orderBy('createdAt').reverse().toArray();
      setAccessories(allAccessories);
    } catch (error) {
      console.error('Aksesuarlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const quantity = parseInt(formData.quantity);
      const price = parseFloat(formData.price);

      if (isNaN(quantity) || quantity <= 0) {
        setMessage('Lütfen geçerli bir adet girin!');
        return;
      }

      if (isNaN(price) || price < 0) {
        setMessage('Lütfen geçerli bir fiyat girin!');
        return;
      }

      if (editingAccessory) {
        // Düzenleme modu
        await db.accessories.update(editingAccessory.id!, {
          name: formData.name,
          type: formData.type,
          quantity,
          price
        });
        setMessage('Aksesuar başarıyla güncellendi!');
        setEditingAccessory(null);
      } else {
        // Yeni ekleme modu
        const accessory: Omit<Accessory, 'id'> = {
          name: formData.name,
          type: formData.type,
          quantity,
          price,
          createdAt: new Date()
        };
        await db.accessories.add(accessory);
        setMessage('Aksesuar başarıyla eklendi!');
      }

      setFormData({ name: '', type: 'kılıf', quantity: '', price: '' });
      loadAccessories();
    } catch (error) {
      setMessage('Hata oluştu: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (accessory: Accessory) => {
    setEditingAccessory(accessory);
    setFormData({
      name: accessory.name,
      type: accessory.type,
      quantity: accessory.quantity.toString(),
      price: accessory.price.toString()
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu aksesuarı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await db.accessories.delete(id);
      setMessage('Aksesuar silindi!');
      loadAccessories();
    } catch (error) {
      setMessage('Silme işlemi sırasında hata oluştu!');
    }
  };

  const handleCancel = () => {
    setEditingAccessory(null);
    setFormData({ name: '', type: 'kılıf', quantity: '', price: '' });
    setMessage('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredByType = (type: string) => {
    return accessories.filter(a => a.type === type);
  };

  const totalValue = accessories.reduce((sum, a) => sum + (a.price * a.quantity), 0);

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="accessories-container">
      <h2>Stoktaki Aksesuarlar</h2>

      <div className="accessories-stats">
        <div className="stat-card info">
          <h3>Toplam Aksesuar</h3>
          <div className="stat-value">{accessories.length}</div>
        </div>
        <div className="stat-card success">
          <h3>Toplam Değer</h3>
          <div className="stat-value">₺{totalValue.toFixed(2)}</div>
        </div>
      </div>

      <div className="accessory-form">
        <h3>{editingAccessory ? 'Aksesuar Düzenle' : 'Yeni Aksesuar Ekle'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Aksesuar Adı:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Örn: iPhone 15 Pro Kılıfı"
            />
          </div>

          <div className="form-group">
            <label>Tür:</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="kılıf">Kılıf</option>
              <option value="ekran koruyucu">Ekran Koruyucu</option>
              <option value="kablo">Kablo</option>
            </select>
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

          <div className="form-group">
            <label>Birim Fiyat (₺):</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              step="0.01"
              placeholder="0.00"
            />
          </div>

          {message && (
            <div className={`message ${message.includes('başarıyla') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (editingAccessory ? 'Güncelleniyor...' : 'Ekleniyor...') : (editingAccessory ? 'Güncelle' : 'Aksesuar Ekle')}
            </button>
            {editingAccessory && (
              <button type="button" onClick={handleCancel}>
                İptal
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="accessories-list">
        <h3>Aksesuar Listesi</h3>
        
        <div className="accessories-by-type">
          <div className="accessory-type-section">
            <h4>Kılıflar ({filteredByType('kılıf').length})</h4>
            <div className="accessories-grid">
              {filteredByType('kılıf').map(accessory => (
                <div key={accessory.id} className="accessory-card">
                  <div className="accessory-header">
                    <h4>{accessory.name}</h4>
                    <div className="accessory-actions">
                      <button 
                        onClick={() => handleEdit(accessory)}
                        className="edit-button-small"
                      >
                        Düzenle
                      </button>
                      <button 
                        onClick={() => handleDelete(accessory.id!)}
                        className="delete-button"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                  <div className="accessory-details">
                    <p><strong>Adet:</strong> {accessory.quantity}</p>
                    <p><strong>Birim Fiyat:</strong> ₺{accessory.price.toFixed(2)}</p>
                    <p><strong>Toplam Değer:</strong> ₺{(accessory.price * accessory.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="accessory-type-section">
            <h4>Ekran Koruyucular ({filteredByType('ekran koruyucu').length})</h4>
            <div className="accessories-grid">
              {filteredByType('ekran koruyucu').map(accessory => (
                <div key={accessory.id} className="accessory-card">
                  <div className="accessory-header">
                    <h4>{accessory.name}</h4>
                    <div className="accessory-actions">
                      <button 
                        onClick={() => handleEdit(accessory)}
                        className="edit-button-small"
                      >
                        Düzenle
                      </button>
                      <button 
                        onClick={() => handleDelete(accessory.id!)}
                        className="delete-button"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                  <div className="accessory-details">
                    <p><strong>Adet:</strong> {accessory.quantity}</p>
                    <p><strong>Birim Fiyat:</strong> ₺{accessory.price.toFixed(2)}</p>
                    <p><strong>Toplam Değer:</strong> ₺{(accessory.price * accessory.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="accessory-type-section">
            <h4>Kablolar ({filteredByType('kablo').length})</h4>
            <div className="accessories-grid">
              {filteredByType('kablo').map(accessory => (
                <div key={accessory.id} className="accessory-card">
                  <div className="accessory-header">
                    <h4>{accessory.name}</h4>
                    <div className="accessory-actions">
                      <button 
                        onClick={() => handleEdit(accessory)}
                        className="edit-button-small"
                      >
                        Düzenle
                      </button>
                      <button 
                        onClick={() => handleDelete(accessory.id!)}
                        className="delete-button"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                  <div className="accessory-details">
                    <p><strong>Adet:</strong> {accessory.quantity}</p>
                    <p><strong>Birim Fiyat:</strong> ₺{accessory.price.toFixed(2)}</p>
                    <p><strong>Toplam Değer:</strong> ₺{(accessory.price * accessory.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {accessories.length === 0 && (
          <div className="no-accessories">
            <p>Henüz aksesuar eklenmemiş</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessoriesManager;

