import React, { useState, useEffect } from 'react';
import { Debt } from '../types';
import { db } from '../utils/database';

const DebtsManager: React.FC = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    try {
      setLoading(true);
      const allDebts = await db.debts.orderBy('date').reverse().toArray();
      setDebts(allDebts);
    } catch (error) {
      console.error('Borçlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const amount = parseFloat(formData.amount);

      if (isNaN(amount) || amount <= 0) {
        setMessage('Lütfen geçerli bir tutar girin!');
        return;
      }

      if (editingDebt) {
        // Düzenleme modu
        await db.debts.update(editingDebt.id!, {
          description: formData.description,
          amount,
          date: new Date(formData.date)
        });
        setMessage('Borç başarıyla güncellendi!');
        setEditingDebt(null);
      } else {
        // Yeni ekleme modu
        const debt: Omit<Debt, 'id'> = {
          description: formData.description,
          amount,
          date: new Date(formData.date),
          createdAt: new Date()
        };
        await db.debts.add(debt);
        setMessage('Borç başarıyla eklendi!');
      }
      
      setFormData({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
      loadDebts();
    } catch (error) {
      setMessage('Hata oluştu: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setFormData({
      description: debt.description,
      amount: debt.amount.toString(),
      date: new Date(debt.date).toISOString().split('T')[0]
    });
  };

  const handleCancel = () => {
    setEditingDebt(null);
    setFormData({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
    setMessage('');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu borcu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await db.debts.delete(id);
      setMessage('Borç silindi!');
      loadDebts();
    } catch (error) {
      setMessage('Silme işlemi sırasında hata oluştu!');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const totalDebts = debts.reduce((sum, debt) => sum + debt.amount, 0);

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="debts-container">
      <h2>Borçlar Yönetimi</h2>
      
      <div className="debts-stats">
        <div className="stat-card warning">
          <h3>Toplam Borç</h3>
          <div className="stat-value">₺{totalDebts.toFixed(2)}</div>
        </div>
        <div className="stat-card info">
          <h3>Borç Sayısı</h3>
          <div className="stat-value">{debts.length}</div>
        </div>
      </div>

      <div className="debt-form">
        <h3>{editingDebt ? 'Borç Düzenle' : 'Yeni Borç Ekle'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Açıklama:</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Borç açıklaması"
            />
          </div>

          <div className="form-group">
            <label>Tutar (₺):</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label>Tarih:</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          {message && (
            <div className={`message ${message.includes('başarıyla') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (editingDebt ? 'Güncelleniyor...' : 'Ekleniyor...') : (editingDebt ? 'Güncelle' : 'Borç Ekle')}
            </button>
            {editingDebt && (
              <button type="button" onClick={handleCancel}>
                İptal
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="debts-list">
        <h3>Borç Listesi</h3>
        {debts.length === 0 ? (
          <div className="no-debts">
            <p>Henüz borç eklenmemiş</p>
          </div>
        ) : (
          <div className="debts-grid">
            {debts.map(debt => (
              <div key={debt.id} className="debt-card">
                <div className="debt-header">
                  <h4>{debt.description}</h4>
                  <div className="debt-actions">
                    <button 
                      onClick={() => handleEdit(debt)}
                      className="edit-button-small"
                    >
                      Düzenle
                    </button>
                    <button 
                      onClick={() => handleDelete(debt.id!)}
                      className="delete-button"
                    >
                      Sil
                    </button>
                  </div>
                </div>
                <div className="debt-details">
                  <p><strong>Tutar:</strong> ₺{debt.amount.toFixed(2)}</p>
                  <p><strong>Tarih:</strong> {new Date(debt.date).toLocaleDateString('tr-TR')}</p>
                  <p><strong>Eklenme:</strong> {new Date(debt.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtsManager;
