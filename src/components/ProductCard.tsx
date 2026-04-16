import React, { useState } from 'react';
import { MenuItem } from '../types';
import { useCart } from '../CartContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface ProductCardProps {
  product: MenuItem;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMassa, setSelectedMassa] = useState<string>('');
  const [selectedRecheio, setSelectedRecheio] = useState<string>('');
  const [selectedSalgados, setSelectedSalgados] = useState<string[]>([]);
  const [selectedDoces, setSelectedDoces] = useState<string[]>([]);

  const handleAddToCart = () => {
    if (product.customizable) {
      if (product.category === 'Bolos Temáticos') {
        if (!selectedMassa || !selectedRecheio) {
          toast.error('Por favor, selecione a massa e o recheio.');
          return;
        }
        addToCart(product, { selectedMassa, selectedRecheio });
      } else if (product.category === 'Kits Festa') {
        const max = product.options?.maxSelections || 0;
        if (selectedSalgados.length === 0) {
          toast.error('Por favor, selecione pelo menos um tipo de salgado.');
          return;
        }
        if (selectedSalgados.length > max) {
          toast.error(`Você pode selecionar no máximo ${max} tipos de salgados.`);
          return;
        }
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
    setSelectedSalgados([]);
    setSelectedDoces([]);
  };

  const toggleSalgado = (salgado: string) => {
    setSelectedSalgados((prev) =>
      prev.includes(salgado) ? prev.filter((s) => s !== salgado) : [...prev, salgado]
    );
  };

  const toggleDoce = (doce: string) => {
    setSelectedDoces((prev) =>
      prev.includes(doce) ? prev.filter((d) => d !== doce) : [...prev, doce]
    );
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
            <DialogTrigger asChild>
              <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white">
                Personalizar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Personalizar {product.name}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-grow pr-4">
                <div className="space-y-6 py-4">
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
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">
                          Salgados (Máx {product.options?.maxSelections})
                        </Label>
                        <div className="grid grid-cols-1 gap-2">
                          {product.options?.salgados?.map((s) => (
                            <div key={s} className="flex items-center space-x-2">
                              <Checkbox
                                id={`salgado-${s}`}
                                checked={selectedSalgados.includes(s)}
                                onCheckedChange={() => toggleSalgado(s)}
                                disabled={!selectedSalgados.includes(s) && selectedSalgados.length >= (product.options?.maxSelections || 0)}
                              />
                              <Label htmlFor={`salgado-${s}`}>{s}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      {product.options?.doces && (
                        <div className="space-y-3">
                          <Label className="text-base font-semibold">Doces</Label>
                          <div className="grid grid-cols-1 gap-2">
                            {product.options?.doces?.map((d) => (
                              <div key={d} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`doce-${d}`}
                                  checked={selectedDoces.includes(d)}
                                  onCheckedChange={() => toggleDoce(d)}
                                />
                                <Label htmlFor={`doce-${d}`}>{d}</Label>
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
          <Button onClick={handleAddToCart} className="w-full bg-pink-500 hover:bg-pink-600 text-white">
            Adicionar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
