import React, { useState } from 'react';
import { db } from '../utils/database';

const BackupRestore: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExport = async () => {
    setIsProcessing(true);
    setMessage('');

    try {
      // Tüm verileri al
      const products = await db.products.toArray();
      const sales = await db.sales.toArray();
      const monthlyData = await db.monthlyData.toArray();
      const debts = await db.debts.toArray();
      const accessories = await db.accessories.toArray();

      const backupData = {
        products,
        sales,
        monthlyData,
        debts,
        accessories,
        exportDate: new Date().toISOString(),
        version: '2.0'
      };

      // JSON dosyası oluştur
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      // Dosyayı indir
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `appleogz-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage('Yedekleme başarıyla tamamlandı!');
    } catch (error) {
      setMessage('Yedekleme sırasında hata oluştu: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setMessage('');

    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      // Veri formatını kontrol et (eski versiyonlar için uyumluluk)
      if (!backupData.products || !backupData.sales || !backupData.monthlyData) {
        setMessage('Geçersiz yedek dosyası!');
        return;
      }

      if (!confirm('Mevcut tüm veriler silinecek ve yedek dosyasındaki veriler yüklenecek. Devam etmek istediğinizden emin misiniz?')) {
        return;
      }

      // Mevcut verileri temizle
      await db.products.clear();
      await db.sales.clear();
      await db.monthlyData.clear();
      await db.debts.clear();
      await db.accessories.clear();

      // Yedek verilerini yükle
      await db.products.bulkAdd(backupData.products);
      await db.sales.bulkAdd(backupData.sales);
      await db.monthlyData.bulkAdd(backupData.monthlyData);
      
      // Yeni tablolar (eski yedeklerde olmayabilir)
      if (backupData.debts) {
        await db.debts.bulkAdd(backupData.debts);
      }
      if (backupData.accessories) {
        await db.accessories.bulkAdd(backupData.accessories);
      }

      const debtsCount = backupData.debts ? backupData.debts.length : 0;
      const accessoriesCount = backupData.accessories ? backupData.accessories.length : 0;
      setMessage(`Yedek başarıyla yüklendi! ${backupData.products.length} ürün, ${backupData.sales.length} satış, ${backupData.monthlyData.length} ay verisi, ${debtsCount} borç, ${accessoriesCount} aksesuar.`);
      
      // Sayfayı yenile
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setMessage('Yedek yüklenirken hata oluştu: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
      // Input'u temizle
      event.target.value = '';
    }
  };

  return (
    <div className="backup-container">
      <h2>Yedekleme ve Geri Yükleme</h2>
      
      <div className="backup-actions">
        <div className="backup-section">
          <h3>Verileri Yedekle</h3>
          <p>Tüm ürün, satış, ay, borç ve aksesuar verilerinizi JSON dosyası olarak indirin.</p>
          <button 
            onClick={handleExport}
            disabled={isProcessing}
            className="export-button"
          >
            {isProcessing ? 'Yedekleniyor...' : 'Yedekle'}
          </button>
        </div>

        <div className="backup-section">
          <h3>Yedekten Geri Yükle</h3>
          <p>Daha önce oluşturduğunuz yedek dosyasını seçin.</p>
          <div className="file-input-container">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isProcessing}
              id="import-file"
              style={{ display: 'none' }}
            />
            <label htmlFor="import-file" className="import-button">
              {isProcessing ? 'Yükleniyor...' : 'Dosya Seç'}
            </label>
          </div>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('başarıyla') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="backup-info">
        <h3>Yedekleme Hakkında</h3>
        <ul>
          <li>Yedekleme tüm verilerinizi JSON formatında saklar</li>
          <li>Yedek dosyası tarih damgası ile otomatik adlandırılır</li>
          <li>Geri yükleme işlemi mevcut tüm verileri siler</li>
          <li>Düzenli yedekleme yapmanız önerilir</li>
          <li>Yedek dosyalarınızı güvenli bir yerde saklayın</li>
        </ul>
      </div>
    </div>
  );
};

export default BackupRestore;
