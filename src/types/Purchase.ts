export interface Purchase {
  id: string;
  quantity: number;
  unit: string;
  description: string;
  brand?: string;
  unitPrice: number;
  totalPrice: number;
  market: string;
  purchaseDate: string;
  createdAt: string;
}

export interface PurchaseFormData {
  quantity: string;
  unit: string;
  description: string;
  brand: string;
  unitPrice: string;
  totalPrice: string;
  market: string;
  purchaseDate: string;
}
