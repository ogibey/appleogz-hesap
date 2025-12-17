import React, { useState, useEffect } from 'react';
import { Sale, Product, Accessory } from '../types';
import { db } from '../utils/database';

const SalesList: React.FC = () => {
  const [sales, setSales] = useState<Array<Sale & { productName: string; accessoriesInfo: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    salePrice: '',
    cost: '',
    saleDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const allSales = await db.sales.orderBy('saleDate').reverse().toArray();
      const allProducts = await db.products.toArray();
      const allAccessories = await db.accessories.toArray();

      const salesWithDetails = await Promise.all(
        allSales.map(async (sale) => {
          const product = allProducts.find(p => p.id === sale.productId);
          const productName = product?.name || 'Bilinmeyen Ürün';
          
          // Aksesuar bilgilerini formatla
          let accessoriesInfo = '';
          if (sale.accessories && sale.accessories.length > 0) {
            const accessoryNames = await Promise.all(
              sale.accessories.map(async (sa) => {
                const accessory = allAccessories.find(a => a.id === sa.accessoryId);
                return accessory ? `${accessory.name} (${sa.quantity} adet)` : 'Bilinmeyen';
              })
            );
            accessoriesInfo = accessoryNames.join(', ');
          } else {
            accessoriesInfo = 'Yok';
          }

          return {
            ...sale,
            productName,
            accessoriesInfo
          };
        })
      );

      setSales(salesWithDetails);
    } catch (error) {
      console.error('Satışlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setFormData({
      customerName: sale.customerName,
      salePrice: sale.salePrice.toString(),
      cost: sale.cost.toString(),
      saleDate: new Date(sale.saleDate).toISOString().split('T')[0]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSale) return;

    setIsSubmitting(true);
    setMessage('');

    try {
      const salePrice = parseFloat(formData.salePrice);
      const cost = parseFloat(formData.cost);

      if (isNaN(salePrice) || isNaN(cost)) {
        setMessage('Lütfen geçerli sayılar girin!');
        return;
      }

      // Ürün bilgisini al
      const product = await db.products.get(editingSale.productId);
      if (!product) {
        setMessage('Ürün bulunamadı!');
        return;
      }

      // Aksesuar maliyetini hesapla
      const allAccessories = await db.accessories.toArray();
      let accessoriesTotalCost = 0;
      if (editingSale.accessories && editingSale.accessories.length > 0) {
        accessoriesTotalCost = editingSale.accessories.reduce((sum, sa) => {
          const accessory = allAccessories.find(a => a.id === sa.accessoryId);
          return sum + (accessory ? accessory.price * sa.quantity : 0);
        }, 0);
      }

      // Net kar hesaplama
      const netProfit = salePrice - (product.purchasePrice * editingSale.quantity + cost + accessoriesTotalCost);

      await db.sales.update(editingSale.id!, {
        customerName: formData.customerName,
        salePrice,
        cost,
        saleDate: new Date(formData.saleDate),
        netProfit
      });

      setMessage('Satış başarıyla güncellendi!');
      setEditingSale(null);
      setFormData({ customerName: '', salePrice: '', cost: '', saleDate: '' });
      loadSales();
    } catch (error) {
      setMessage('Hata oluştu: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu satışı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await db.sales.delete(id);
      setMessage('Satış silindi!');
      loadSales();
    } catch (error) {
      setMessage('Silme işlemi sırasında hata oluştu!');
    }
  };

  const handleCancel = () => {
    setEditingSale(null);
    setFormData({ customerName: '', salePrice: '', cost: '', saleDate: '' });
    setMessage('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.salePrice, 0);
  const totalProfit = sales.reduce((sum, sale) => sum + sale.netProfit, 0);

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="sales-list-container">
      <h2>Tüm Satışlar</h2>

      <div className="sales-stats">
        <div className="stat-card primary">
          <h3>Toplam Satış</h3>
          <div className="stat-value">{totalSales}</div>
        </div>
        <div className="stat-card success">
          <h3>Toplam Ciro</h3>
          <div className="stat-value">₺{totalRevenue.toFixed(2)}</div>
        </div>
        <div className="stat-card info">
          <h3>Toplam Kar</h3>
          <div className="stat-value">₺{totalProfit.toFixed(2)}</div>
        </div>
      </div>

      {editingSale ? (
        <div className="edit-form">
          <h3>Satış Düzenle</h3>
          <form onSubmit={handleSubmit}>
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

            <div className="form-group">
              <label>Maliyet (₺):</label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                required
                step="0.01"
                placeholder="0.00"
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
        <div className="sales-table-container">
          {sales.length === 0 ? (
            <div className="no-sales">
              <p>Henüz satış yapılmamış</p>
            </div>
          ) : (
            <div className="sales-grid">
              {sales.map(sale => (
                <div key={sale.id} className="sale-card">
                  <div className="sale-header">
                    <h4>{sale.productName}</h4>
                    <div className="sale-actions">
                      <button 
                        onClick={() => handleEdit(sale)}
                        className="edit-button-small"
                      >
                        Düzenle
                      </button>
                      <button 
                        onClick={() => handleDelete(sale.id!)}
                        className="delete-button"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                  <div className="sale-details">
                    <p><strong>Müşteri:</strong> {sale.customerName}</p>
                    <p><strong>Satış Fiyatı:</strong> ₺{sale.salePrice.toFixed(2)}</p>
                    <p><strong>Maliyet:</strong> ₺{sale.cost.toFixed(2)}</p>
                    <p><strong>Net Kar:</strong> ₺{sale.netProfit.toFixed(2)}</p>
                    <p><strong>Adet:</strong> {sale.quantity}</p>
                    <p><strong>IMEI:</strong> {sale.imei}</p>
                    <p><strong>Verilen Aksesuarlar:</strong> {sale.accessoriesInfo}</p>
                    <p><strong>Tarih:</strong> {new Date(sale.saleDate).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesList;

