import React from 'react';
import { useCart } from '../CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartSheet: React.FC<CartSheetProps> = ({ isOpen, onClose, onCheckout }) => {
  const { cart, removeFromCart, updateQuantity, total } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-pink-700">
            <ShoppingCart className="w-5 h-5" />
            Seu Carrinho
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-grow my-4 pr-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
              <p>Seu carrinho está vazio</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.cartId} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      {item.selectedMassa && (
                        <p className="text-xs text-gray-500">Massa: {item.selectedMassa}</p>
                      )}
                      {item.selectedRecheio && (
                        <p className="text-xs text-gray-500">Recheio: {item.selectedRecheio}</p>
                      )}
                      {item.selectedSalgados && item.selectedSalgados.length > 0 && (
                        <p className="text-xs text-gray-500">Salgados: {item.selectedSalgados.join(', ')}</p>
                      )}
                      {item.selectedDoces && item.selectedDoces.length > 0 && (
                        <p className="text-xs text-gray-500">Doces: {item.selectedDoces.join(', ')}</p>
                      )}
                      <p className="text-sm font-medium text-pink-600 mt-1">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => removeFromCart(item.cartId)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <SheetFooter className="mt-auto pt-4 flex flex-col gap-4">
          <p className="text-[10px] text-pink-700 font-medium text-center bg-pink-50 py-1 rounded">
            * Pedido mínimo de 15 unidades por item selecionado.
          </p>
          <div className="flex justify-between items-center w-full text-lg font-bold">
            <span>Total</span>
            <span className="text-pink-600">R$ {total.toFixed(2)}</span>
          </div>
          <Button 
            className="w-full bg-pink-500 hover:bg-pink-600 h-12 text-lg"
            disabled={cart.length === 0}
            onClick={onCheckout}
          >
            Finalizar Pedido
          </Button>
          <p className="text-[10px] text-center text-gray-400">
            * 50% de entrada no ato do pedido, 50% na entrega.
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
