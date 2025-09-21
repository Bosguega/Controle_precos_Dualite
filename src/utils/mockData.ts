import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { Purchase } from '../types/Purchase';

const UNITS = ['kg', 'g', 'litro', 'ml', 'unidade', 'pacote', 'caixa'];
const MARKETS = [
  'Pão de Açúcar',
  'Extra',
  'Carrefour',
  'Big',
  'Walmart',
  'Hortifruti',
  'Mercadinho do Bairro',
  'Atacadão',
  'Sam\'s Club'
];

const PRODUCTS = [
  { description: 'Arroz branco tipo 1', brands: ['Tio João', 'Camil', 'Prato Fino', 'Blue Ville'], unit: 'kg' },
  { description: 'Feijão preto', brands: ['Camil', 'Kicaldo', 'Namorado'], unit: 'kg' },
  { description: 'Açúcar cristal', brands: ['União', 'Cristal', 'Caravelas'], unit: 'kg' },
  { description: 'Leite integral', brands: ['Nestlé', 'Parmalat', 'Piracanjuba', 'Italac'], unit: 'litro' },
  { description: 'Óleo de soja', brands: ['Soya', 'Liza', 'Salada'], unit: 'litro' },
  { description: 'Farinha de trigo', brands: ['Dona Benta', 'Sol', 'Renata'], unit: 'kg' },
  { description: 'Macarrão espaguete', brands: ['Barilla', 'Galo', 'Adria'], unit: 'pacote' },
  { description: 'Café torrado e moído', brands: ['Pilão', '3 Corações', 'Santa Clara'], unit: 'pacote' },
  { description: 'Ovos brancos', brands: ['Mantiqueira', 'Korin', 'Naturovo'], unit: 'dúzia' },
  { description: 'Banana prata', brands: [], unit: 'kg' },
  { description: 'Tomate', brands: [], unit: 'kg' },
  { description: 'Cebola', brands: [], unit: 'kg' },
  { description: 'Batata inglesa', brands: [], unit: 'kg' },
  { description: 'Frango inteiro congelado', brands: ['Sadia', 'Perdigão', 'Seara'], unit: 'kg' },
  { description: 'Carne moída', brands: [], unit: 'kg' }
];

export const generateMockPurchases = (count: number = 50): Purchase[] => {
  const purchases: Purchase[] = [];
  
  for (let i = 0; i < count; i++) {
    const product = faker.helpers.arrayElement(PRODUCTS);
    const market = faker.helpers.arrayElement(MARKETS);
    const brand = product.brands.length > 0 ? faker.helpers.arrayElement([...product.brands, '']) : '';
    
    const quantity = parseFloat(faker.number.float({ min: 0.1, max: 5, fractionDigits: 2 }).toFixed(2));
    const unitPrice = parseFloat(faker.number.float({ min: 1, max: 50, fractionDigits: 2 }).toFixed(2));
    const totalPrice = parseFloat((quantity * unitPrice).toFixed(2));
    
    const daysAgo = faker.number.int({ min: 0, max: 365 });
    const purchaseDate = new Date();
    purchaseDate.setDate(purchaseDate.getDate() - daysAgo);
    
    purchases.push({
      id: uuidv4(),
      quantity,
      unit: product.unit,
      description: product.description,
      brand: brand || undefined,
      unitPrice,
      totalPrice,
      market,
      purchaseDate: purchaseDate.toISOString().split('T')[0],
      createdAt: new Date(purchaseDate.getTime() + faker.number.int({ min: 0, max: 86400000 })).toISOString()
    });
  }
  
  return purchases.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
};
