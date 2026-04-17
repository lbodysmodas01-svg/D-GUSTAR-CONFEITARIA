import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const SuccessPage: React.FC = () => {
  useEffect(() => {
    // You could verify the session here if needed
  }, []);

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6"
      >
        <div className="flex justify-center">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Pagamento Realizado!</h1>
        <p className="text-gray-600">
          Sua entrada foi processada com sucesso. Agora, envie seu pedido via WhatsApp para confirmarmos os detalhes da produção.
        </p>
        <Button 
          onClick={() => window.location.href = '/'}
          className="w-full bg-pink-500 hover:bg-pink-600"
        >
          Voltar para o Início
        </Button>
      </motion.div>
    </div>
  );
};
