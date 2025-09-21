import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Download, Upload, Trash2, AlertCircle } from 'lucide-react';
import { usePurchases } from '../hooks/usePurchases';

export const DatabaseStatus: React.FC = () => {
  const { getStatistics, clearAllData, exportData, importData } = usePurchases();
  const [stats, setStats] = useState({ totalPurchases: 0, monthlySpent: 0, monthlyItems: 0 });
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      const dbStats = await getStatistics();
      setStats(dbStats);
    };
    
    loadStats();
    
    // Atualizar estatísticas a cada 30 segundos
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [getStatistics]);

  const handleExport = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compras-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar:', error);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        await importData(data);
        alert('Dados importados com sucesso!');
        window.location.reload(); // Recarregar para atualizar interface
      } catch (error) {
        console.error('Erro ao importar:', error);
        alert('Erro ao importar dados. Verifique o formato do arquivo.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = async () => {
    try {
      await clearAllData();
      setShowClearConfirm(false);
      setStats({ totalPurchases: 0, monthlySpent: 0, monthlyItems: 0 });
      alert('Todos os dados foram removidos!');
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      alert('Erro ao limpar dados.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 mb-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Database className="h-6 w-6 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Status do Banco de Dados</h2>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.totalPurchases}</div>
          <div className="text-sm text-blue-600">Compras no Banco</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {stats.monthlySpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <div className="text-sm text-green-600">Gasto Mensal</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(stats.monthlyItems)}
          </div>
          <div className="text-sm text-purple-600">Itens Mensais</div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex flex-wrap gap-3">
        <motion.button
          onClick={handleExport}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Exportar Dados
        </motion.button>

        <motion.label
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors cursor-pointer"
        >
          <Upload className="h-4 w-4" />
          Importar Dados
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </motion.label>

        <motion.button
          onClick={() => setShowClearConfirm(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Limpar Todos
        </motion.button>
      </div>

      {/* Informações sobre IndexedDB */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-gray-500 mt-0.5" />
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Sobre o Banco de Dados:</p>
            <ul className="space-y-1 text-xs">
              <li>• Usa IndexedDB (banco local do navegador)</li>
              <li>• Dados persistem mesmo após fechar o navegador</li>
              <li>• Mais rápido e robusto que localStorage</li>
              <li>• Suporta consultas complexas e índices</li>
              <li>• Exportação/importação para backup</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {showClearConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowClearConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Limpar Banco</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja remover <strong>TODAS</strong> as compras do banco de dados? 
              Esta ação não pode ser desfeita!
            </p>
            
            <div className="flex gap-3">
              <motion.button
                onClick={() => setShowClearConfirm(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </motion.button>
              <motion.button
                onClick={handleClearData}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Limpar Tudo
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};
