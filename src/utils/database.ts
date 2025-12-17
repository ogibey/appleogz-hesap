import Dexie, { Table } from 'dexie';
import { Product, Sale, MonthlyData, Debt, Accessory } from '../types';

export class AppleOGZDatabase extends Dexie {
  products!: Table<Product>;
  sales!: Table<Sale>;
  monthlyData!: Table<MonthlyData>;
  debts!: Table<Debt>;
  accessories!: Table<Accessory>;

  constructor() {
    super('AppleOGZHesapDB');
    this.version(3).stores({
      products: '++id, name, code, isSold, monthYear, createdAt',
      sales: '++id, productId, customerName, saleDate, createdAt',
      monthlyData: '++id, monthYear, isActive, createdAt',
      debts: '++id, description, amount, date, createdAt',
      accessories: '++id, name, type, quantity, price, createdAt'
    });
  }
}

export const db = new AppleOGZDatabase();
