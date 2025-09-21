import Dexie, { Table } from 'dexie';
import { Purchase } from '../types/Purchase';

export class PurchaseDatabase extends Dexie {
  purchases!: Table<Purchase>;

  constructor() {
    super('GroceryPriceTracker');
    
    this.version(1).stores({
      purchases: 'id, description, brand, market, purchaseDate, unitPrice, totalPrice, createdAt'
    });
  }
}

export const db = new PurchaseDatabase();
