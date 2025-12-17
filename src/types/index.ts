export interface Product {
  id?: number;
  name: string;
  purchasePrice: number;
  quantity: number; // Adet bilgisi
  code: string; // AOGZ-YYYYMM-XXXX formatında
  isSold: boolean;
  createdAt: Date;
  monthYear: string; // YYYY-MM formatında
}

export interface Sale {
  id?: number;
  productId: number;
  customerName: string;
  saleDate: Date;
  imei: string;
  salePrice: number; // Satış sırasında girilir
  cost: number; // Kargo + diğer maliyetler
  netProfit: number; // Satış fiyatı - (Alış + Maliyet + Aksesuar Maliyeti)
  quantity: number; // Satılan adet
  accessories?: SaleAccessory[]; // Verilen aksesuarlar (opsiyonel - eski satışlarda olmayabilir)
  createdAt: Date;
}

export interface Accessory {
  id?: number;
  name: string;
  type: 'kılıf' | 'ekran koruyucu' | 'kablo';
  quantity: number;
  price: number; // Birim fiyat
  createdAt: Date;
}

export interface SaleAccessory {
  accessoryId: number;
  quantity: number;
  price: number; // Satış anındaki fiyat
}

export interface Debt {
  id?: number;
  description: string;
  amount: number;
  date: Date;
  createdAt: Date;
}

export interface MonthlyData {
  id?: number;
  monthYear: string; // YYYY-MM
  isActive: boolean;
  createdAt: Date;
}

export interface DashboardStats {
  totalProducts: number;
  soldProducts: number;
  stockValue: number;
  totalProfit: number;
  monthlyProfit: number;
}
