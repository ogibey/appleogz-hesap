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
  cost: number; // Kargo + aksesuar - satış sırasında girilir
  netProfit: number; // Satış fiyatı - (Alış + Maliyet)
  quantity: number; // Satılan adet
  createdAt: Date;
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
