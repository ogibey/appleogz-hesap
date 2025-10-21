export interface Product {
  id?: number;
  name: string;
  purchasePrice: number;
  cost: number; // Kargo + aksesuar
  netProfit: number; // Satış fiyatı - (Alış + Maliyet)
  code: string; // AOGZ-YYYYMM-XXXX formatında
  salePrice: number;
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
  salePrice: number;
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
