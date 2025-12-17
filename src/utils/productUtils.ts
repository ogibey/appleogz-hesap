// Product type is not used in this file

// Otomatik kod üretimi: AOGZ-YYYYMM-XXXX
export const generateProductCode = (monthYear: string): string => {
  const timestamp = Date.now().toString().slice(-4);
  return `AOGZ-${monthYear}-${timestamp}`;
};

// Net kar hesaplama
export const calculateNetProfit = (salePrice: number, purchasePrice: number, cost: number): number => {
  return salePrice - (purchasePrice + cost);
};

// Mevcut ayı al
export const getCurrentMonthYear = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Aylık devir için yeni ay oluştur
export const getNextMonthYear = (currentMonthYear: string): string => {
  const [year, month] = currentMonthYear.split('-').map(Number);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
};
