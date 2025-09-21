import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Calendar, MapPin, Tag, TrendingUp, TrendingDown, Trash2, AlertTriangle } from 'lucide-react';
import { Purchase } from '../types/Purchase';

interface PurchaseListProps {
  purchases: Purchase[];
  searchQuery: string;
  onDelete: (purchaseId: string) => void;
}

export const PurchaseList: React.FC<PurchaseListProps> = ({ purchases, searchQuery, onDelete }) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getPriceComparison = (purchase: Purchase, allPurchases: Purchase[]) => {
    const samePurchases = allPurchases
      .filter(p => 
        p.description.toLowerCase() === purchase.description.toLowerCase() &&
        p.id !== purchase.id &&
        new Date(p.purchaseDate) < new Date(purchase.purchaseDate)
      )
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

    if (samePurchases.length === 0) return null;

    const lastPurchase = samePurchases[0];
    const currentPrice = purchase.unitPrice;
    const lastPrice = lastPurchase.unitPrice;
    const difference = ((currentPrice - lastPrice) / lastPrice) * 100;

    return { difference, lastPrice };
  };

  const handleDeleteClick = (purchaseId: string) => {
    setDeleteConfirm(purchaseId);
  };

  const confirmDelete = (purchaseId: string) => {
    onDelete(purchaseId);
    setDeleteConfirm(null);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  if (purchases.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">
          {searchQuery ? 'Nenhuma compra encontrada para sua pesquisa.' : 'Nenhuma compra registrada ainda.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Histórico de Compras ({purchases.length})
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Produto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Quantidade</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Preço Unit.</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Preço Total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Mercado</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Data</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Comparação</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence>
                {purchases.map((purchase, index) => {
                  const priceComparison = getPriceComparison(purchase, purchases);
                  
                  return (
                    <motion.tr
                      key={purchase.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{purchase.description}</div>
                          {purchase.brand && (
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                              <Tag className="h-3 w-3" />
                              {purchase.brand}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {purchase.quantity} {purchase.unit}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {formatPrice(purchase.unitPrice)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {formatPrice(purchase.totalPrice)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-700">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {purchase.market}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-700">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(purchase.purchaseDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {priceComparison ? (
                          <div className="flex items-center gap-1">
                            {priceComparison.difference > 0 ? (
                              <>
                                <TrendingUp className="h-4 w-4 text-red-500" />
                                <span className="text-red-600 font-semibold text-sm">
                                  +{priceComparison.difference.toFixed(1)}%
                                </span>
                              </>
                            ) : (
                              <>
                                <TrendingDown className="h-4 w-4 text-green-500" />
                                <span className="text-green-600 font-semibold text-sm">
                                  {priceComparison.difference.toFixed(1)}%
                                </span>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Primeira compra</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <motion.button
                          onClick={() => handleDeleteClick(purchase.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir compra"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal de Confirmação */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={cancelDelete}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Confirmar Exclusão</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja excluir esta compra? Esta ação não pode ser desfeita.
              </p>
              
              <div className="flex gap-3">
                <motion.button
                  onClick={cancelDelete}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  onClick={() => confirmDelete(deleteConfirm)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Excluir
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
