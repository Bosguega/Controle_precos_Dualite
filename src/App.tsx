import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, TrendingUp, Search, Settings, Plus, Database } from 'lucide-react';
import { PurchaseForm } from './components/PurchaseForm';
import { SearchFilters } from './components/SearchFilters';
import { PurchaseList } from './components/PurchaseList';
import { DatabaseSettings } from './components/DatabaseSettings';
import { usePurchases } from './hooks/usePurchases';
import { generateMockPurchases } from './utils/mockData';
import { Purchase } from './types/Purchase';

type ActiveTab = 'register' | 'search' | 'settings';

function App() {
  const { 
    purchases, 
    loading, 
    savePurchase, 
    deletePurchase, 
    searchPurchases, 
    getUniqueValues,
    getStatistics
  } = usePurchases();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('register');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'price-asc' | 'price-desc'>('date');
  const [stats, setStats] = useState({
    totalPurchases: 0,
    monthlySpent: 0,
    monthlyItems: 0
  });

  // Carregar estatísticas
  useEffect(() => {
    const loadStats = async () => {
      const dbStats = await getStatistics();
      setStats(dbStats);
    };
    
    if (!loading) {
      loadStats();
    }
  }, [loading, purchases, getStatistics]);

  // Inicializar com dados mock se não houver compras
  useEffect(() => {
    const initializeMockData = async () => {
      if (!loading && purchases.length === 0) {
        const mockPurchases = generateMockPurchases(30);
        for (const purchase of mockPurchases) {
          try {
            await savePurchase(purchase);
          } catch (error) {
            console.error('Erro ao salvar compra mock:', error);
          }
        }
      }
    };

    initializeMockData();
  }, [loading, purchases.length]);

  const filteredPurchases = useMemo(() => {
    let filtered = searchPurchases(searchQuery);

    // Filtro de data
    if (dateFilter !== 'all') {
      const days = parseInt(dateFilter);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      filtered = filtered.filter(purchase => 
        new Date(purchase.purchaseDate) >= cutoffDate
      );
    }

    // Ordenação
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.unitPrice - b.unitPrice);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.unitPrice - a.unitPrice);
    } else {
      filtered.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
    }

    return filtered;
  }, [searchPurchases, searchQuery, dateFilter, sortBy]);

  const suggestions = {
    descriptions: getUniqueValues('description'),
    brands: getUniqueValues('brand').filter(Boolean),
    markets: getUniqueValues('market'),
    units: ['kg', 'g', 'litro', 'ml', 'unidade', 'pacote', 'caixa']
  };

  const tabs = [
    { id: 'register' as ActiveTab, name: 'Cadastro', icon: Plus },
    { id: 'search' as ActiveTab, name: 'Pesquisa', icon: Search },
    { id: 'settings' as ActiveTab, name: 'Configurações', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="p-4 bg-white rounded-2xl shadow-lg mb-4">
            <Database className="h-12 w-12 text-blue-600 animate-pulse mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Carregando Banco de Dados</h2>
          <p className="text-gray-500">Preparando seus dados...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="p-3 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl shadow-lg">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Controle de Preços</h1>
                <p className="text-gray-600 mt-1">Registre suas compras e compare preços</p>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="hidden md:flex gap-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalPurchases}</div>
                <div className="text-sm text-gray-600">Total de Compras</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.monthlySpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <div className="text-sm text-gray-600">Gasto Mensal</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(stats.monthlyItems)}
                </div>
                <div className="text-sm text-gray-600">Itens Mensais</div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-2 py-4 px-3 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.name}
                </motion.button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'register' && (
          <motion.div
            key="register"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PurchaseForm 
              onSave={savePurchase}
              suggestions={suggestions}
            />
          </motion.div>
        )}

        {activeTab === 'search' && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <SearchFilters
              onSearch={setSearchQuery}
              onDateFilter={setDateFilter}
              onSortChange={setSortBy}
            />
            <PurchaseList 
              purchases={filteredPurchases}
              searchQuery={searchQuery}
              onDelete={deletePurchase}
            />
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DatabaseSettings />
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5" />
            <span className="font-semibold">Controle de Preços</span>
          </div>
          <p className="text-gray-400">
            Tome decisões de compra mais conscientes com IndexedDB
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
