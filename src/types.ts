
export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  unit?: string;
  image?: string;
  customizable?: boolean;
  options?: {
    massas?: string[];
    recheios?: string[];
    salgados?: string[];
    doces?: string[];
    maxSelections?: number;
  };
}

export interface CartItem extends MenuItem {
  cartId: string;
  quantity: number;
  selectedMassa?: string;
  selectedRecheio?: string;
  selectedSalgados?: string[];
  selectedDoces?: string[];
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  createdAt: Date;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryMethod: 'Retirada no Local' | 'Uber Entrega';
  paymentStatus: 'pending' | 'paid';
}
