import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onDateFilter: (period: string) => void;
  onSortChange: (sort: 'date' | 'price-asc' | 'price-desc') => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  onSearch,
  onDateFilter,
  onSortChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'price-asc' | 'price-desc'>('date');

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    onDateFilter(period);
  };

  const handleSortChange = (sort: 'date' | 'price-asc' | 'price-desc') => {
    setSortBy(sort);
    onSortChange(sort);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 mb-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Search className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Pesquisar Compras</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Campo de Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por produto, marca ou mercado..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
          />
        </div>

        {/* Filtro de Período */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors appearance-none"
          >
            <option value="all">Todas as compras</option>
            <option value="7">Últimos 7 dias</option>
            <option value="30">Último mês</option>
            <option value="90">Últimos 3 meses</option>
          </select>
        </div>

        {/* Ordenação */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as 'date' | 'price-asc' | 'price-desc')}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors appearance-none"
          >
            <option value="date">Data mais recente</option>
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
          </select>
        </div>
      </div>

      {/* Resumo de Filtros Ativos */}
      {(searchQuery || selectedPeriod !== 'all' || sortBy !== 'date') && (
        <div className="mt-4 flex flex-wrap gap-2">
          {searchQuery && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Busca: "{searchQuery}"
            </span>
          )}
          {selectedPeriod !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              <Calendar className="h-3 w-3 mr-1" />
              {selectedPeriod === '7' ? 'Últimos 7 dias' :
               selectedPeriod === '30' ? 'Último mês' : 'Últimos 3 meses'}
            </span>
          )}
          {sortBy !== 'date' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              {sortBy === 'price-asc' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {sortBy === 'price-asc' ? 'Menor preço' : 'Maior preço'}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};
