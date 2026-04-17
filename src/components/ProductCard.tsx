import React, { useState } from 'react';
import { MenuItem } from '../types';
import { useCart } from '../CartContext';
import { auth } from '../firebase';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Info } from 'lucide-react';
import { toast } from 'sonner';

interface ProductCardProps {
  product: MenuItem;
  onAuthRequired: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAuthRequired }) => {
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMassa, setSelectedMassa] = useState<string>('');
  const [selectedRecheio, setSelectedRecheio] = useState<string>('');
  const [salgadosQtys, setSalgadosQtys] = useState<Record<string, number>>({});
  const [docesQtys, setDocesQtys] = useState<Record<string, number>>({});

  const MIN_QTY = 15;

  const updateQty = (type: 'salgados' | 'doces', name: string, delta: number) => {
    const setQtys = type === 'salgados' ? setSalgadosQtys : setDocesQtys;
    
    setQtys(prev => {
      const current = prev[name] || 0;
      let next = current + delta;
      
      // Initial jump from 0 to 15
      if (current === 0 && delta > 0) {
        next = MIN_QTY;
      }
      
      // If dropping below minimum, remove it
      if (next < MIN_QTY) {
        next = 0;
      }
      
      const newObj = { ...prev };
      if (next <= 0) {
        delete newObj[name];
      } else {
        newObj[name] = next;
      }
      return newObj;
    });
  };

  const selectedSalgadosTotal = Object.values(salgadosQtys).reduce((a: number, b: number) => a + b, 0 as number);
  const selectedDocesTotal = Object.values(docesQtys).reduce((a: number, b: number) => a + b, 0 as number);
  const selectedSalgadosCount = Object.keys(salgadosQtys).length;

  const handleAddToCart = () => {
    if (product.customizable) {
      if (product.category === 'Bolos Temáticos') {
        if (!selectedMassa || !selectedRecheio) {
          toast.error('Por favor, selecione a massa e o recheio.');
          return;
        }
        addToCart(product, { selectedMassa, selectedRecheio });
      } else if (product.category === 'Kits Festa') {
        const maxTypes = product.options?.maxSelections || 0;
        if (selectedSalgadosTotal === 0 && product.options?.salgados?.length) {
          toast.error('Por favor, selecione pelo menos um tipo de salgado.');
          return;
        }
        if (maxTypes > 0 && selectedSalgadosCount > maxTypes) {
          toast.error(`Você pode selecionar no máximo ${maxTypes} tipos de salgados.`);
          return;
        }
        
        // Format object back into string array for compatibility
        const selectedSalgados = Object.entries(salgadosQtys).map(([name, qty]) => `${name} (${qty} unid)`);
        const selectedDoces = Object.entries(docesQtys).map(([name, qty]) => `${name} (${qty} unid)`);
        
        addToCart(product, { selectedSalgados, selectedDoces });
      }
      setIsOpen(false);
      resetCustomization();
    } else {
      addToCart(product);
    }
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  const resetCustomization = () => {
    setSelectedMassa('');
    setSelectedRecheio('');
    setSalgadosQtys({});
    setDocesQtys({});
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full border-pink-100 hover:border-pink-300 transition-colors">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold text-pink-800">{product.name}</CardTitle>
          <Badge variant="secondary" className="bg-pink-50 text-pink-600">
            {product.unit}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-sm text-gray-600 mb-2">{product.description}</p>
        <p className="text-xl font-bold text-pink-600">
          R$ {product.price.toFixed(2)}
        </p>
      </CardContent>
      <CardFooter className="p-4">
        {product.customizable ? (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button 
               className="w-full bg-pink-500 hover:bg-pink-600 text-white"
               onClick={() => {
                 if (!auth.currentUser) {
                   onAuthRequired();
                   toast.info('Para escolher itens e personalizar seu pedido, é necessário estar cadastrado.');
                 } else {
                   setIsOpen(true);
                 }
               }}
            >
              Personalizar
            </Button>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Personalizar {product.name}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-grow pr-4">
                <div className="space-y-6 py-4">
                  <div className="flex items-center gap-2 p-3 bg-pink-50 border border-pink-100 rounded-lg text-pink-800 text-xs font-medium mb-2">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <span>Atenção: Pedido mínimo de 15 unidades por item escolhido.</span>
                  </div>
                  {product.category === 'Bolos Temáticos' && (
                    <>
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Massa</Label>
                        <RadioGroup value={selectedMassa} onValueChange={setSelectedMassa}>
                          {product.options?.massas?.map((m) => (
                            <div key={m} className="flex items-center space-x-2">
                              <RadioGroupItem value={m} id={`massa-${m}`} />
                              <Label htmlFor={`massa-${m}`}>{m}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Recheio</Label>
                        <RadioGroup value={selectedRecheio} onValueChange={setSelectedRecheio}>
                          {product.options?.recheios?.map((r) => (
                            <div key={r} className="flex items-center space-x-2">
                              <RadioGroupItem value={r} id={`recheio-${r}`} />
                              <Label htmlFor={`recheio-${r}`}>{r}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </>
                  )}

                  {product.category === 'Kits Festa' && (
                    <>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-pink-50 p-3 rounded-lg border border-pink-100">
                          <Label className="text-base font-semibold text-pink-800">
                            Salgados {product.options?.maxSelections ? `(Máx ${product.options.maxSelections} tipos)` : ''}
                          </Label>
                          <Badge className="bg-pink-500">{selectedSalgadosTotal} unidades ativas</Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-1 border border-gray-100 bg-white rounded-lg overflow-hidden divide-y divide-gray-50">
                          {product.options?.salgados?.map((s) => (
                            <div key={s} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                              <Label htmlFor={`salgado-${s}`} className="flex-1 cursor-pointer select-none">{s}</Label>
                              <div className="flex items-center gap-3">
                                {salgadosQtys[s] ? (
                                  <div className="flex items-center border border-pink-200 rounded-md bg-white">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-pink-600 hover:bg-pink-100 hover:text-pink-700 rounded-none rounded-l-md"
                                      onClick={() => updateQty('salgados', s, -1)}
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <span className="w-8 text-center text-sm font-semibold text-gray-700">{salgadosQtys[s]}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-pink-600 hover:bg-pink-100 hover:text-pink-700 rounded-none rounded-r-md"
                                      onClick={() => updateQty('salgados', s, 1)}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700 w-[104px]"
                                    onClick={() => updateQty('salgados', s, 1)}
                                    disabled={product.options?.maxSelections ? selectedSalgadosCount >= product.options.maxSelections : false}
                                  >
                                    + Adicionar
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {product.options?.doces && product.options.doces.length > 0 && (
                        <div className="space-y-4 pt-2">
                          <div className="flex justify-between items-center bg-pink-50 p-3 rounded-lg border border-pink-100">
                            <Label className="text-base font-semibold text-pink-800">Doces</Label>
                            <Badge className="bg-pink-500">{selectedDocesTotal} unidades ativas</Badge>
                          </div>
                          <div className="grid grid-cols-1 gap-1 border border-gray-100 bg-white rounded-lg overflow-hidden divide-y divide-gray-50">
                            {product.options?.doces?.map((d) => (
                              <div key={d} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                                <Label htmlFor={`doce-${d}`} className="flex-1 cursor-pointer select-none">{d}</Label>
                                <div className="flex items-center gap-3">
                                  {docesQtys[d] ? (
                                    <div className="flex items-center border border-pink-200 rounded-md bg-white">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-pink-600 hover:bg-pink-100 hover:text-pink-700 rounded-none rounded-l-md"
                                        onClick={() => updateQty('doces', d, -1)}
                                      >
                                        <Minus className="w-3 h-3" />
                                      </Button>
                                      <span className="w-8 text-center text-sm font-semibold text-gray-700">{docesQtys[d]}</span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-pink-600 hover:bg-pink-100 hover:text-pink-700 rounded-none rounded-r-md"
                                        onClick={() => updateQty('doces', d, 1)}
                                      >
                                        <Plus className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="h-8 border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700 w-[104px]"
                                      onClick={() => updateQty('doces', d, 1)}
                                    >
                                      + Adicionar
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>
              <DialogFooter className="mt-4">
                <Button onClick={handleAddToCart} className="w-full bg-pink-500 hover:bg-pink-600">
                  Adicionar ao Carrinho
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Button 
            onClick={() => {
              if (!auth.currentUser) {
                onAuthRequired();
                toast.info('Para adicionar itens ao carrinho e realizar pedidos, é necessário estar cadastrado.');
              } else {
                handleAddToCart();
              }
            }} 
            className="w-full bg-pink-500 hover:bg-pink-600 text-white"
          >
            Adicionar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
