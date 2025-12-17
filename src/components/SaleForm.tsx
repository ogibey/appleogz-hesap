import React, { useState, useEffect } from 'react';
import { Product, Sale, Accessory, SaleAccessory } from '../types';
import { db } from '../utils/database';

interface SaleFormProps {
  onSaleCompleted: () => void;
}

const SaleForm: React.FC<SaleFormProps> = ({ onSaleCompleted }) => {
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [availableAccessories, setAvailableAccessories] = useState<Accessory[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [selectedAccessories, setSelectedAccessories] = useState<Array<{ accessoryId: number; quantity: number }>>([]);
  const [formData, setFormData] = useState({
    customerName: '',
    imei: '',
    saleDate: new Date().toISOString().split('T')[0],
    salePrice: '',
    cost: '',
    quantity: '1'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAvailableProducts();
    loadAvailableAccessories();
  }, []);

  const loadAvailableProducts = async () => {
    try {
      // Tüm ürünleri al ve isSold false olanları filtrele
      const allProducts = await db.products.toArray();
      const availableProducts = allProducts.filter(p => !p.isSold);
      setAvailableProducts(availableProducts);
    } catch (error) {
      setMessage('Ürünler yüklenirken hata oluştu!');
    }
  };

  const loadAvailableAccessories = async () => {
    try {
      const allAccessories = await db.accessories.toArray();
      const available = allAccessories.filter(a => a.quantity > 0);
      setAvailableAccessories(available);
    } catch (error) {
      console.error('Aksesuarlar yüklenirken hata:', error);
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

      const salePrice = parseFloat(formData.salePrice);
      const cost = parseFloat(formData.cost);
      const quantity = parseInt(formData.quantity);

      if (isNaN(salePrice) || isNaN(cost) || isNaN(quantity) || quantity <= 0) {
        setMessage('Lütfen geçerli sayılar girin!');
        return;
      }

      if (quantity > product.quantity) {
        setMessage(`Stokta sadece ${product.quantity} adet var!`);
        return;
      }

      // Seçilen aksesuarları kontrol et ve toplam maliyetini hesapla
      const saleAccessories: SaleAccessory[] = [];
      let accessoriesTotalCost = 0;

      for (const selected of selectedAccessories) {
        const accessory = availableAccessories.find(a => a.id === selected.accessoryId);
        if (!accessory) {
          setMessage(`Seçilen aksesuar bulunamadı!`);
          return;
        }
        if (selected.quantity > accessory.quantity) {
          setMessage(`${accessory.name} için stokta sadece ${accessory.quantity} adet var!`);
          return;
        }
        
        const accessoryCost = accessory.price * selected.quantity;
        accessoriesTotalCost += accessoryCost;
        
        saleAccessories.push({
          accessoryId: selected.accessoryId,
          quantity: selected.quantity,
          price: accessory.price
        });
      }

      // Net kar hesaplama: Satış Fiyatı - (Alış Fiyatı + Diğer Maliyetler + Aksesuar Maliyeti)
      const netProfit = salePrice - (product.purchasePrice * quantity + cost + accessoriesTotalCost);

      const sale: Omit<Sale, 'id'> = {
        productId: selectedProductId as number,
        customerName: formData.customerName,
        saleDate: new Date(formData.saleDate),
        imei: formData.imei,
        salePrice: salePrice,
        cost: cost,
        netProfit: netProfit,
        quantity: quantity,
        accessories: saleAccessories,
        createdAt: new Date()
      };

      // Satış kaydını ekle
      await db.sales.add(sale);

      // Seçilen aksesuarları stoktan düş
      for (const selected of selectedAccessories) {
        const accessory = availableAccessories.find(a => a.id === selected.accessoryId);
        if (accessory) {
          const newQuantity = accessory.quantity - selected.quantity;
          if (newQuantity <= 0) {
            await db.accessories.update(selected.accessoryId, { quantity: 0 });
          } else {
            await db.accessories.update(selected.accessoryId, { quantity: newQuantity });
          }
        }
      }

      // Ürün stok miktarını güncelle
      const newQuantity = product.quantity - quantity;
      if (newQuantity <= 0) {
        // Stok bitti, ürünü satıldı olarak işaretle
        await db.products.update(selectedProductId, { isSold: true, quantity: 0 });
      } else {
        // Stok güncelle
        await db.products.update(selectedProductId, { quantity: newQuantity });
      }

      setMessage(`Satış başarıyla tamamlandı! Müşteri: ${formData.customerName}`);
      setFormData({ customerName: '', imei: '', saleDate: new Date().toISOString().split('T')[0], salePrice: '', cost: '', quantity: '1' });
      setSelectedProductId('');
      setSelectedAccessories([]);
      
      // Stok listesini yenile
      loadAvailableProducts();
      loadAvailableAccessories();
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
                {product.name} - {product.code} (₺{product.purchasePrice})
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <div className="product-info">
            <h3>Seçilen Ürün:</h3>
            <p><strong>Ad:</strong> {selectedProduct.name}</p>
            <p><strong>Kod:</strong> {selectedProduct.code}</p>
            <p><strong>Alış Fiyatı:</strong> ₺{selectedProduct.purchasePrice}</p>
            <p><strong>Stokta:</strong> {selectedProduct.quantity} adet</p>
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
            placeholder="Kargo + diğer maliyetler"
          />
        </div>

        <div className="form-group">
          <label>Verilen Aksesuarlar:</label>
          {availableAccessories.length === 0 ? (
            <p className="info-text">Stokta aksesuar bulunmuyor</p>
          ) : (
            <div className="accessories-selection">
              {availableAccessories.map(accessory => {
                const selected = selectedAccessories.find(s => s.accessoryId === accessory.id);
                const selectedQuantity = selected ? selected.quantity : 0;
                
                return (
                  <div key={accessory.id} className="accessory-selection-item">
                    <div className="accessory-info">
                      <span><strong>{accessory.name}</strong> ({accessory.type})</span>
                      <span>Stokta: {accessory.quantity} | Fiyat: ₺{accessory.price.toFixed(2)}</span>
                    </div>
                    <div className="accessory-quantity-control">
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedQuantity > 0 && accessory.id) {
                            const updated = selectedAccessories.map(s =>
                              s.accessoryId === accessory.id
                                ? { ...s, quantity: s.quantity - 1 }
                                : s
                            ).filter(s => s.quantity > 0);
                            setSelectedAccessories(updated);
                          }
                        }}
                        disabled={selectedQuantity === 0 || !accessory.id}
                        className="quantity-button"
                      >
                        -
                      </button>
                      <span className="quantity-display">{selectedQuantity}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedQuantity < accessory.quantity && accessory.id) {
                            const existing = selectedAccessories.find(s => s.accessoryId === accessory.id);
                            if (existing) {
                              setSelectedAccessories(
                                selectedAccessories.map(s =>
                                  s.accessoryId === accessory.id
                                    ? { ...s, quantity: s.quantity + 1 }
                                    : s
                                )
                              );
                            } else {
                              setSelectedAccessories([
                                ...selectedAccessories,
                                { accessoryId: accessory.id, quantity: 1 }
                              ]);
                            }
                          }
                        }}
                        disabled={selectedQuantity >= accessory.quantity || !accessory.id}
                        className="quantity-button"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
              {selectedAccessories.length > 0 && (
                <div className="accessories-summary">
                  <strong>Seçilen Aksesuarlar Toplam Maliyeti: ₺{
                    selectedAccessories.reduce((sum, s) => {
                      const accessory = availableAccessories.find(a => a.id === s.accessoryId);
                      return sum + (accessory ? accessory.price * s.quantity : 0);
                    }, 0).toFixed(2)
                  }</strong>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Satılan Adet:</label>
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
