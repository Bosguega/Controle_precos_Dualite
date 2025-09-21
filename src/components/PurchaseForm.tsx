import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Calculator } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Purchase, PurchaseFormData } from '../types/Purchase';

interface PurchaseFormProps {
  onSave: (purchase: Purchase) => void;
  suggestions: {
    descriptions: string[];
    brands: string[];
    markets: string[];
    units: string[];
  };
}

const UNITS = ['kg', 'g', 'litro', 'ml', 'unidade', 'pacote', 'caixa'];

export const PurchaseForm: React.FC<PurchaseFormProps> = ({ onSave, suggestions }) => {
  const [formData, setFormData] = useState<PurchaseFormData>({
    quantity: '',
    unit: 'unidade',
    description: '',
    brand: '',
    unitPrice: '',
    totalPrice: '',
    market: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Partial<PurchaseFormData>>({});
  const [lastCalculated, setLastCalculated] = useState<'unit' | 'total' | null>(null);

  const calculatePrices = (field: 'unitPrice' | 'totalPrice', value: string) => {
    const quantity = parseFloat(formData.quantity);
    const numValue = parseFloat(value);

    if (!quantity || !numValue || quantity <= 0 || numValue <= 0) return;

    if (field === 'unitPrice') {
      const total = (numValue * quantity).toFixed(2);
      setFormData(prev => ({ ...prev, totalPrice: total }));
      setLastCalculated('total');
    } else {
      const unit = (numValue / quantity).toFixed(2);
      setFormData(prev => ({ ...prev, unitPrice: unit }));
      setLastCalculated('unit');
    }
  };

  const handleInputChange = (field: keyof PurchaseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));

    if (field === 'quantity' && value) {
      const quantity = parseFloat(value);
      if (quantity > 0) {
        if (formData.unitPrice && lastCalculated !== 'unit') {
          calculatePrices('unitPrice', formData.unitPrice);
        } else if (formData.totalPrice && lastCalculated !== 'total') {
          calculatePrices('totalPrice', formData.totalPrice);
        }
      }
    }

    if (field === 'unitPrice' && value && formData.quantity) {
      calculatePrices('unitPrice', value);
    }

    if (field === 'totalPrice' && value && formData.quantity) {
      calculatePrices('totalPrice', value);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PurchaseFormData> = {};

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantidade deve ser maior que 0';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }
    if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
      newErrors.unitPrice = 'Preço unitário deve ser maior que 0';
    }
    if (!formData.totalPrice || parseFloat(formData.totalPrice) <= 0) {
      newErrors.totalPrice = 'Preço total deve ser maior que 0';
    }
    if (!formData.market.trim()) {
      newErrors.market = 'Mercado é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const purchase: Purchase = {
      id: uuidv4(),
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      description: formData.description.trim(),
      brand: formData.brand.trim() || undefined,
      unitPrice: parseFloat(formData.unitPrice),
      totalPrice: parseFloat(formData.totalPrice),
      market: formData.market.trim(),
      purchaseDate: formData.purchaseDate,
      createdAt: new Date().toISOString()
    };

    onSave(purchase);

    // Reset form
    setFormData({
      quantity: '',
      unit: 'unidade',
      description: '',
      brand: '',
      unitPrice: '',
      totalPrice: '',
      market: '',
      purchaseDate: new Date().toISOString().split('T')[0]
    });
    setErrors({});
    setLastCalculated(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 mb-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Save className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Nova Compra</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quantidade e Unidade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidade *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                {UNITS.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              list="descriptions"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nome do produto"
            />
            <datalist id="descriptions">
              {suggestions.descriptions.map(desc => (
                <option key={desc} value={desc} />
              ))}
            </datalist>
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Marca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marca
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              list="brands"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Marca do produto"
            />
            <datalist id="brands">
              {suggestions.brands.map(brand => (
                <option key={brand} value={brand} />
              ))}
            </datalist>
          </div>

          {/* Preços */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preço Unitário * (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.unitPrice}
              onChange={(e) => handleInputChange('unitPrice', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.unitPrice ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {lastCalculated === 'unit' && (
              <Calculator className="absolute right-3 top-11 h-4 w-4 text-green-500" />
            )}
            {errors.unitPrice && (
              <p className="text-red-500 text-sm mt-1">{errors.unitPrice}</p>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preço Total * (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.totalPrice}
              onChange={(e) => handleInputChange('totalPrice', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.totalPrice ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {lastCalculated === 'total' && (
              <Calculator className="absolute right-3 top-11 h-4 w-4 text-green-500" />
            )}
            {errors.totalPrice && (
              <p className="text-red-500 text-sm mt-1">{errors.totalPrice}</p>
            )}
          </div>

          {/* Mercado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mercado *
            </label>
            <input
              type="text"
              value={formData.market}
              onChange={(e) => handleInputChange('market', e.target.value)}
              list="markets"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.market ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nome do mercado"
            />
            <datalist id="markets">
              {suggestions.markets.map(market => (
                <option key={market} value={market} />
              ))}
            </datalist>
            {errors.market && (
              <p className="text-red-500 text-sm mt-1">{errors.market}</p>
            )}
          </div>

          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data da Compra *
            </label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-3"
        >
          <Save className="h-5 w-5" />
          Salvar Compra
        </motion.button>
      </form>
    </motion.div>
  );
};
