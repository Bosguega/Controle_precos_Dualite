import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Download, Upload, Trash2, AlertCircle, Settings, BarChart3, Calendar, DollarSign } from 'lucide-react';
import { usePurchases } from '../hooks/usePurchases';

export const DatabaseSettings: React.FC = () => {
  const { getStatistics, clearAllData, exportData, importData } = usePurchases();
  const [stats, setStats] = useState({ 
    totalPurchases: 0, 
    monthlySpent: 0, 
    monthlyItems: 0 
  });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
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
      alert('Erro ao exportar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = async () => {
    try {
      setLoading(true);
      await clearAllData();
      setShowClearConfirm(false);
      setStats({ totalPurchases: 0, monthlySpent: 0, monthlyItems: 0 });
      alert('Todos os dados foram removidos!');
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      alert('Erro ao limpar dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-indigo-100 rounded-2xl">
            <Settings className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h2>
        <p className="text-gray-600">Gerencie seu banco de dados e configurações do aplicativo</p>
      </motion.div>

      {/* Estatísticas Detalhadas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Estatísticas do Banco</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 text-center"
          >
            <div className="p-3 bg-blue-600 rounded-full w-fit mx-auto mb-4">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalPurchases}</div>
            <div className="text-sm font-medium text-blue-600">Total de Compras</div>
            <div className="text-xs text-blue-500 mt-1">Registradas no banco</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 text-center"
          >
            <div className="p-3 bg-green-600 rounded-full w-fit mx-auto mb-4">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.monthlySpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <div className="text-sm font-medium text-green-600">Gasto Mensal</div>
            <div className="text-xs text-green-500 mt-1">Mês atual</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 text-center"
          >
            <div className="p-3 bg-purple-600 rounded-full w-fit mx-auto mb-4">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {Math.round(stats.monthlyItems)}
            </div>
            <div className="text-sm font-medium text-purple-600">Itens Mensais</div>
            <div className="text-xs text-purple-500 mt-1">Quantidade total</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Gerenciamento de Dados */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Database className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Gerenciamento de Dados</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            onClick={handleExport}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center gap-3 p-6 border-2 border-blue-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-50"
          >
            <div className="p-3 bg-blue-100 rounded-full">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">Exportar Dados</div>
              <div className="text-sm text-gray-600">Download em JSON</div>
            </div>
          </motion.button>

          <motion.label
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center gap-3 p-6 border-2 border-green-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all cursor-pointer"
          >
            <div className="p-3 bg-green-100 rounded-full">
              <Upload className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">Importar Dados</div>
              <div className="text-sm text-gray-600">Upload de backup</div>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={loading}
              className="hidden"
            />
          </motion.label>

          <motion.button
            onClick={() => setShowClearConfirm(true)}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center gap-3 p-6 border-2 border-red-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all disabled:opacity-50"
          >
            <div className="p-3 bg-red-100 rounded-full">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">Limpar Tudo</div>
              <div className="text-sm text-gray-600">Remover todos os dados</div>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Informações Técnicas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-100 rounded-lg">
            <AlertCircle className="h-6 w-6 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Sobre o Banco de Dados</h3>
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Tecnologia IndexedDB</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                  Banco de dados local do navegador
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                  Dados persistem após fechar o navegador
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                  Suporte a grandes volumes de dados
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                  Consultas com índices otimizados
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Funcionalidades</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                  Backup e restauração completa
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                  Busca avançada e filtros
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                  Estatísticas em tempo real
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                  Comparação automática de preços
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

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
            className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirmar Limpeza</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Tem certeza que deseja remover <strong>TODAS</strong> as {stats.totalPurchases} compras do banco de dados?
              </p>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-800 text-sm font-medium">
                  ⚠️ Esta ação não pode ser desfeita!
                </p>
                <p className="text-red-600 text-sm mt-1">
                  Recomendamos fazer um backup antes de continuar.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <motion.button
                onClick={() => setShowClearConfirm(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </motion.button>
              <motion.button
                onClick={handleClearData}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Limpando...' : 'Limpar Tudo'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
