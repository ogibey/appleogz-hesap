import Dexie, { Table } from 'dexie';
import { Product, Sale, MonthlyData } from '../types';

export class AppleOGZDatabase extends Dexie {
  products!: Table<Product>;
  sales!: Table<Sale>;
  monthlyData!: Table<MonthlyData>;

  constructor() {
    super('AppleOGZHesapDB');
    this.version(1).stores({
      products: '++id, name, code, isSold, monthYear, createdAt',
      sales: '++id, productId, customerName, saleDate, createdAt',
      monthlyData: '++id, monthYear, isActive, createdAt'
    });
  }
}

export const db = new AppleOGZDatabase();
