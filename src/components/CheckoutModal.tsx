import React, { useState } from 'react';
import { useCart } from '../CartContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, total, clearCart } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('Retirada no Local');
  const [isLoading, setIsLoading] = useState(false);

  const saveOrderToFirestore = async (orderId: number) => {
    try {
      await addDoc(collection(db, 'orders'), {
        orderId,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        deliveryMethod,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          selectedMassa: item.selectedMassa || null,
          selectedRecheio: item.selectedRecheio || null,
          selectedSalgados: item.selectedSalgados || [],
          selectedDoces: item.selectedDoces || []
        })),
        total,
        status: 'pending',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const handleFinishOrder = async () => {
    if (!name || !phone || (deliveryMethod === 'Uber Entrega' && !address)) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true);
    try {
      const orderId = Math.floor(100000 + Math.random() * 900000);
      await saveOrderToFirestore(orderId);

      const orderDate = new Date().toLocaleString('pt-BR');

      let message = `*NOVO PEDIDO - D'GUSTAR & CONFEITARIA*\n`;
      message += `*Ordem:* #${orderId}\n`;
      message += `*Data:* ${orderDate}\n\n`;
      message += `*CLIENTE*\n`;
      message += `Nome: ${name}\n`;
      message += `Telefone: ${phone}\n`;
      message += `Entrega: ${deliveryMethod}\n`;
      if (deliveryMethod === 'Uber Entrega') {
        message += `Endereço: ${address}\n`;
      }
      message += `\n*ITENS DO PEDIDO*\n`;

      cart.forEach((item) => {
        message += `• ${item.quantity}x ${item.name}\n`;
        if (item.selectedMassa) message += `  - Massa: ${item.selectedMassa}\n`;
        if (item.selectedRecheio) message += `  - Recheio: ${item.selectedRecheio}\n`;
        if (item.selectedSalgados && item.selectedSalgados.length > 0) {
          message += `  - Salgados: ${item.selectedSalgados.join(', ')}\n`;
        }
        if (item.selectedDoces && item.selectedDoces.length > 0) {
          message += `  - Doces: ${item.selectedDoces.join(', ')}\n`;
        }
        message += `  Subtotal: R$ ${(item.price * item.quantity).toFixed(2)}\n`;
      });

      message += `\n*TOTAL: R$ ${total.toFixed(2)}*\n\n`;
      message += `_Aguardando sua confirmação para iniciar a produção._`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/5571983676361?text=${encodedMessage}`;

      window.open(whatsappUrl, '_blank');
      clearCart();
      onClose();
      toast.success('Pedido enviado com sucesso!');
    } catch (error) {
      console.error('Order Error:', error);
      toast.error('Erro ao finalizar pedido.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-pink-700">Finalizar Pedido</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input 
              id="name" 
              placeholder="Seu nome" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="border-pink-100 focus:border-pink-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp</Label>
            <Input 
              id="phone" 
              placeholder="(71) 99999-9999" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              className="border-pink-100 focus:border-pink-500"
            />
          </div>
          <div className="space-y-3">
            <Label>Método de Entrega</Label>
            <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Retirada no Local" id="retirada" />
                <Label htmlFor="retirada">Retirada no Local</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Uber Entrega" id="uber" />
                <Label htmlFor="uber">Uber Entrega (por conta do cliente)</Label>
              </div>
            </RadioGroup>
          </div>
          {deliveryMethod === 'Uber Entrega' && (
            <div className="space-y-2">
              <Label htmlFor="address">Endereço de Entrega</Label>
              <Input 
                id="address" 
                placeholder="Rua, número, bairro" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                className="border-pink-100 focus:border-pink-500"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            onClick={handleFinishOrder} 
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12"
          >
            {isLoading ? 'Enviando...' : 'Finalizar e Enviar WhatsApp'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
