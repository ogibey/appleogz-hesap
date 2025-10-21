import Dexie, { Table } from 'dexie';
import { Product, Sale, MonthlyData, Debt } from '../types';

export class AppleOGZDatabase extends Dexie {
  products!: Table<Product>;
  sales!: Table<Sale>;
  monthlyData!: Table<MonthlyData>;
  debts!: Table<Debt>;

  constructor() {
    super('AppleOGZHesapDB');
    this.version(2).stores({
      products: '++id, name, code, isSold, monthYear, createdAt',
      sales: '++id, productId, customerName, saleDate, createdAt',
      monthlyData: '++id, monthYear, isActive, createdAt',
      debts: '++id, description, amount, date, createdAt'
    });
  }
}

export const db = new AppleOGZDatabase();
