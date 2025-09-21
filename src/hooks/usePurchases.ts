import { useState, useEffect } from 'react';
import { Purchase } from '../types/Purchase';
import { db } from '../db/database';

export const usePurchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar compras do IndexedDB
  useEffect(() => {
    const loadPurchases = async () => {
      try {
        setLoading(true);
        const allPurchases = await db.purchases.orderBy('createdAt').reverse().toArray();
        setPurchases(allPurchases);
      } catch (error) {
        console.error('Erro ao carregar compras:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPurchases();
  }, []);

  const savePurchase = async (purchase: Purchase) => {
    try {
      await db.purchases.add(purchase);
      setPurchases(prev => [purchase, ...prev]);
    } catch (error) {
      console.error('Erro ao salvar compra:', error);
      throw error;
    }
  };

  const deletePurchase = async (purchaseId: string) => {
    try {
      await db.purchases.delete(purchaseId);
      setPurchases(prev => prev.filter(purchase => purchase.id !== purchaseId));
    } catch (error) {
      console.error('Erro ao excluir compra:', error);
      throw error;
    }
  };

  const searchPurchases = (query: string): Purchase[] => {
    if (!query.trim()) return purchases;
    
    const searchTerm = query.toLowerCase();
    return purchases.filter(purchase => 
      purchase.description.toLowerCase().includes(searchTerm) ||
      purchase.brand?.toLowerCase().includes(searchTerm) ||
      purchase.market.toLowerCase().includes(searchTerm)
    );
  };

  const getUniqueValues = (field: keyof Purchase): string[] => {
    const values = purchases
      .map(p => p[field] as string)
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index);
    return values.sort();
  };

  // Busca avançada no banco
  const searchInDatabase = async (query: string): Promise<Purchase[]> => {
    try {
      const searchTerm = query.toLowerCase();
      const results = await db.purchases
        .filter(purchase => 
          purchase.description.toLowerCase().includes(searchTerm) ||
          purchase.brand?.toLowerCase().includes(searchTerm) ||
          purchase.market.toLowerCase().includes(searchTerm)
        )
        .toArray();
      
      return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Erro na busca:', error);
      return [];
    }
  };

  // Obter compras por período
  const getPurchasesByPeriod = async (days: number): Promise<Purchase[]> => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const results = await db.purchases
        .where('purchaseDate')
        .above(cutoffDate.toISOString().split('T')[0])
        .toArray();
      
      return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Erro ao buscar por período:', error);
      return [];
    }
  };

  // Estatísticas do banco
  const getStatistics = async () => {
    try {
      const totalCount = await db.purchases.count();
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const monthlyPurchases = await db.purchases
        .where('purchaseDate')
        .above(firstDayOfMonth.toISOString().split('T')[0])
        .toArray();
      
      const monthlySpent = monthlyPurchases.reduce((sum, p) => sum + p.totalPrice, 0);
      const monthlyItems = monthlyPurchases.reduce((sum, p) => sum + p.quantity, 0);
      
      return {
        totalPurchases: totalCount,
        monthlySpent,
        monthlyItems
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return {
        totalPurchases: 0,
        monthlySpent: 0,
        monthlyItems: 0
      };
    }
  };

  // Limpar todos os dados
  const clearAllData = async () => {
    try {
      await db.purchases.clear();
      setPurchases([]);
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      throw error;
    }
  };

  // Exportar dados
  const exportData = async (): Promise<Purchase[]> => {
    try {
      return await db.purchases.toArray();
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      return [];
    }
  };

  // Importar dados
  const importData = async (data: Purchase[]) => {
    try {
      await db.purchases.clear();
      await db.purchases.bulkAdd(data);
      const allPurchases = await db.purchases.orderBy('createdAt').reverse().toArray();
      setPurchases(allPurchases);
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      throw error;
    }
  };

  return {
    purchases,
    loading,
    savePurchase,
    deletePurchase,
    searchPurchases,
    getUniqueValues,
    searchInDatabase,
    getPurchasesByPeriod,
    getStatistics,
    clearAllData,
    exportData,
    importData
  };
};
