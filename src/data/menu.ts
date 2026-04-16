import { MenuItem } from '../types';

export const MENU_DATA: MenuItem[] = [
  // Doces Simples
  { id: 'ds-1', name: 'Brigadeiro', category: 'Doces Simples', price: 1.90, unit: 'unid' },
  { id: 'ds-2', name: 'Casadinho', category: 'Doces Simples', price: 1.90, unit: 'unid' },
  { id: 'ds-3', name: 'Beijinho', category: 'Doces Simples', price: 1.90, unit: 'unid' },
  { id: 'ds-4', name: 'Moranguinho', category: 'Doces Simples', price: 1.90, unit: 'unid' },
  { id: 'ds-5', name: 'Cajuzinho', category: 'Doces Simples', price: 1.90, unit: 'unid' },

  // Doces Finos
  { id: 'df-1', name: 'Chokito', category: 'Doces Finos', price: 2.75, unit: 'unid' },
  { id: 'df-2', name: 'Prestígio', category: 'Doces Finos', price: 2.75, unit: 'unid' },
  { id: 'df-3', name: 'Bombom de Uva', category: 'Doces Finos', price: 2.75, unit: 'unid' },
  { id: 'df-4', name: 'Camafeu', category: 'Doces Finos', price: 2.75, unit: 'unid' },
  { id: 'df-5', name: 'Loló', category: 'Doces Finos', price: 2.75, unit: 'unid' },

  // Tartaletes
  { id: 'tt-1', name: 'Brigadeiro', category: 'Tartaletes', price: 2.50, unit: 'unid' },
  { id: 'tt-2', name: 'Limão', category: 'Tartaletes', price: 2.50, unit: 'unid' },
  { id: 'tt-3', name: 'Maracujá', category: 'Tartaletes', price: 2.50, unit: 'unid' },
  { id: 'tt-4', name: 'Casadinho', category: 'Tartaletes', price: 2.50, unit: 'unid' },
  { id: 'tt-5', name: 'Churros', category: 'Tartaletes', price: 2.50, unit: 'unid' },

  // Salgados Fritos
  { id: 'sf-1', name: 'Coxinha Frango', category: 'Salgados Fritos', price: 2.00, unit: 'unid' },
  { id: 'sf-2', name: 'Quibe', category: 'Salgados Fritos', price: 2.00, unit: 'unid' },
  { id: 'sf-3', name: 'Pérola de Queijo', category: 'Salgados Fritos', price: 2.00, unit: 'unid' },
  { id: 'sf-4', name: 'Risole Misto', category: 'Salgados Fritos', price: 2.00, unit: 'unid' },
  { id: 'sf-5', name: 'Risole Calabresa', category: 'Salgados Fritos', price: 2.00, unit: 'unid' },
  { id: 'sf-6', name: 'Boliviano', category: 'Salgados Fritos', price: 2.00, unit: 'unid' },
  { id: 'sf-7', name: 'Pastel Carne', category: 'Salgados Fritos', price: 2.00, unit: 'unid' },
  { id: 'sf-8', name: 'Pastel Frango', category: 'Salgados Fritos', price: 2.00, unit: 'unid' },
  { id: 'sf-9', name: 'Pastel Queijo', category: 'Salgados Fritos', price: 2.00, unit: 'unid' },

  // Salgados de Forno
  { id: 'so-1', name: 'Empada de Frango', category: 'Salgados de Forno', price: 2.25, unit: 'unid' },
  { id: 'so-2', name: 'Pastel de Forno Frango', category: 'Salgados de Forno', price: 2.25, unit: 'unid' },
  { id: 'so-3', name: 'Saltenha', category: 'Salgados de Forno', price: 2.25, unit: 'unid' },
  { id: 'so-4', name: 'Trouxinha Frango', category: 'Salgados de Forno', price: 2.25, unit: 'unid' },
  { id: 'so-5', name: 'Trouxinha Peito de Peru', category: 'Salgados de Forno', price: 2.25, unit: 'unid' },
  { id: 'so-6', name: 'Tropical', category: 'Salgados de Forno', price: 2.25, unit: 'unid' },

  // Especial Fritos
  { id: 'ef-1', name: 'Croquete Bacalhau', category: 'Especial Fritos', price: 2.90, unit: 'unid' },
  { id: 'ef-2', name: 'Croquete Costela', category: 'Especial Fritos', price: 2.90, unit: 'unid' },
  { id: 'ef-3', name: 'Coxinha Camarão', category: 'Especial Fritos', price: 2.90, unit: 'unid' },
  { id: 'ef-4', name: 'Coxinha Costela', category: 'Especial Fritos', price: 2.90, unit: 'unid' },
  { id: 'ef-5', name: 'Risole Camarão', category: 'Especial Fritos', price: 2.90, unit: 'unid' },
  { id: 'ef-6', name: 'Risole Bacalhau', category: 'Especial Fritos', price: 2.90, unit: 'unid' },
  { id: 'ef-7', name: 'Trufa Sertanejo', category: 'Especial Fritos', price: 2.90, unit: 'unid' },
  { id: 'ef-8', name: 'Camarão na Tapioca', category: 'Especial Fritos', price: 3.00, unit: 'unid' },

  // Salgados de Forno Especial
  { id: 'soe-1', name: 'Barquete de Camarão', category: 'Salgados de Forno Especial', price: 2.90, unit: 'unid' },
  { id: 'soe-2', name: 'Empada Camarão', category: 'Salgados de Forno Especial', price: 2.90, unit: 'unid' },
  { id: 'soe-3', name: 'Empada Bacalhau', category: 'Salgados de Forno Especial', price: 2.90, unit: 'unid' },
  { id: 'soe-4', name: 'Trouxinha Camarão', category: 'Salgados de Forno Especial', price: 2.90, unit: 'unid' },
  { id: 'soe-5', name: 'Trouxinha Bacalhau', category: 'Salgados de Forno Especial', price: 2.90, unit: 'unid' },
  { id: 'soe-6', name: 'Pastel de Forno Camarão', category: 'Salgados de Forno Especial', price: 2.90, unit: 'unid' },
  { id: 'soe-7', name: 'Pastel de Forno Bacalhau', category: 'Salgados de Forno Especial', price: 2.90, unit: 'unid' },

  // Quiches
  { id: 'q-1', name: 'Quiche Frango (20cm)', category: 'Quiches', price: 90.00, unit: 'unid' },
  { id: 'q-2', name: 'Quiche Frango (26cm)', category: 'Quiches', price: 140.00, unit: 'unid' },
  { id: 'q-3', name: 'Quiche Peito de Peru (20cm)', category: 'Quiches', price: 100.00, unit: 'unid' },
  { id: 'q-4', name: 'Quiche Peito de Peru (26cm)', category: 'Quiches', price: 160.00, unit: 'unid' },

  // Pão Metro
  { id: 'pm-1', name: 'Pão Metro Frango Cremoso', category: 'Pão Metro', price: 130.00, unit: 'unid' },
  { id: 'pm-2', name: 'Pão Metro Peito de Peru', category: 'Pão Metro', price: 130.00, unit: 'unid' },
  { id: 'pm-3', name: 'Pão Metro Camarão', category: 'Pão Metro', price: 150.00, unit: 'unid' },
  { id: 'pm-4', name: 'Pão Metro Atum', category: 'Pão Metro', price: 140.00, unit: 'unid' },

  // Tortas Doces
  { id: 'td-1', name: 'Torta Matilda (20cm)', category: 'Tortas Doces', price: 180.00, unit: '25 fatias' },
  { id: 'td-2', name: 'Torta Red Velvet (20cm)', category: 'Tortas Doces', price: 190.00, unit: '25 fatias' },
  { id: 'td-3', name: 'Torta Matilda (25cm)', category: 'Tortas Doces', price: 280.00, unit: '35 fatias' },

  // Bolos Temáticos
  { 
    id: 'bt-1', 
    name: 'Bolo Temático 16cm', 
    category: 'Bolos Temáticos', 
    price: 160.00, 
    unit: '15 fatias',
    customizable: true,
    options: {
      massas: ['Baunilha', 'Coco', 'Chocolate', 'Mista', 'Red Velvet'],
      recheios: ['Chocolate', 'Brigadeiro Branco', 'Amendoim', 'Prestígio', 'Casadinho', 'Ameixa', 'Ameixa com Coco']
    }
  },
  { 
    id: 'bt-2', 
    name: 'Bolo Temático 18cm', 
    category: 'Bolos Temáticos', 
    price: 185.00, 
    unit: '20 fatias',
    customizable: true,
    options: {
      massas: ['Baunilha', 'Coco', 'Chocolate', 'Mista', 'Red Velvet'],
      recheios: ['Chocolate', 'Brigadeiro Branco', 'Amendoim', 'Prestígio', 'Casadinho', 'Ameixa', 'Ameixa com Coco']
    }
  },

  // Kits Festa
  { 
    id: 'k-1', 
    name: 'KIT 01', 
    category: 'Kits Festa', 
    price: 290.00, 
    description: 'Bolo 16cm + 25 brigadeiros + 50 salgados (2 tipos)',
    customizable: true,
    options: {
      salgados: ['Coxinha', 'Quibe', 'Pastel Frito', 'Empada'],
      maxSelections: 2
    }
  },
  { 
    id: 'k-2', 
    name: 'KIT 02', 
    category: 'Kits Festa', 
    price: 460.00, 
    description: 'Bolo 20 fatias + 50 doces + 80 salgados (4 tipos)',
    customizable: true,
    options: {
      salgados: ['Coxinha', 'Quibe', 'Empada Frango', 'Pastel Frito', 'Risole Misto', 'Risole Calabresa'],
      doces: ['Brigadeiro', 'Beijinho'],
      maxSelections: 4
    }
  },
  { 
    id: 'k-3', 
    name: 'KIT 03', 
    category: 'Kits Festa', 
    price: 620.00, 
    description: 'Bolo 25 fatias + 80 doces + 100 salgados (4 tipos)',
    customizable: true,
    options: {
      salgados: ['Coxinha', 'Quibe', 'Empada Frango', 'Pastel Frito', 'Risole Misto'],
      doces: ['Brigadeiro', 'Beijinho', 'Casadinho'],
      maxSelections: 4
    }
  }
];
