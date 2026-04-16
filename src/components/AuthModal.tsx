import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // Administrative login handling
  const handleAuth = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast.error('Preencha os campos');
      return;
    }

    setLoading(true);
    try {
      let finalEmail = trimmedEmail;
      
      // Handle special admin login
      const lowerEmail = trimmedEmail.toLowerCase();
      const isAdminUser = lowerEmail === 'vanessadgustarconfeitaria' || 
                         lowerEmail === 'vanessadgustarconfeitaria@admin.com' ||
                         lowerEmail === 'lbodysmodas01@gmail.com';
      
      if (lowerEmail === 'vanessadgustarconfeitaria') {
        finalEmail = 'vanessadgustarconfeitaria@admin.com';
      }

      if (isLogin) {
        try {
          await signInWithEmailAndPassword(auth, finalEmail, trimmedPassword);
        } catch (err: any) {
          // If admin login fails and account doesn't exist, try to auto-create it
          // Handling multiple error codes for maximum compatibility across Firebase versions
          const isNotFoundError = err.code === 'auth/user-not-found' || 
                             err.code === 'auth/invalid-credential' ||
                             err.code === 'auth/invalid-login-credentials';

          if (isAdminUser && isNotFoundError) {
            try {
              const userCredential = await createUserWithEmailAndPassword(auth, finalEmail, trimmedPassword);
              const user = userCredential.user;
              await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                name: 'Vanessa D\'Gustar',
                email: finalEmail,
                role: 'admin',
                createdAt: serverTimestamp()
              });
              toast.success('Acesso administrativo configurado!');
              onClose();
              return;
            } catch (createErr: any) {
               // If creation fails because user already exists (but wrong password), throw that error instead
               if (createErr.code === 'auth/email-already-in-use') {
                 throw new Error('Senha incorreta para o usuário administrativo.');
               }
               throw createErr;
            }
          }
          throw err;
        }
        toast.success('Bem-vindo de volta!');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, finalEmail, trimmedPassword);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });
        
        // Save user profile with role
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: name,
          email: finalEmail,
          role: isAdminUser ? 'admin' : 'user',
          createdAt: serverTimestamp()
        });
        
        toast.success('Conta criada com sucesso!');
      }
      onClose();
    } catch (error: any) {
      console.error('Erro de autenticação:', error);
      let message = 'Erro na autenticação';
      
      if (error.code === 'auth/operation-not-allowed') {
        message = 'O login por E-mail/Senha não está ativado no seu Console do Firebase. Por favor, ative-o em Autenticação > Sign-in Method.';
      } else if (error.code === 'auth/wrong-password' || error.message.includes('Senha incorreta')) {
        message = 'Senha incorreta. Verifique e tente novamente.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Formato de e-mail inválido ou usuário não encontrado.';
      } else if (error.code === 'auth/email-already-in-use') {
        message = 'Este e-mail já está em uso por outro usuário.';
      } else {
        message = error.message;
      }
      toast.error(message, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-pink-600 uppercase tracking-tighter text-center">
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div className="space-y-2">
            <Label>Email ou Usuário</Label>
            <Input 
              placeholder="seu@email.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label>Senha</Label>
            <Input 
              type="password" 
              placeholder="••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <Button 
            className="w-full bg-pink-600 hover:bg-pink-700 h-12 text-lg font-bold" 
            onClick={handleAuth}
            disabled={loading}
          >
            {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
          </Button>
          
          <p className="text-center text-sm text-gray-500">
            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'} {' '}
            <button 
              className="text-pink-600 font-bold hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Cadastre-se' : 'Faça Login'}
            </button>
          </p>

          <div className="mt-8 pt-4 border-t border-gray-100 text-[10px] text-gray-400 text-center uppercase tracking-widest leading-loose">
            Acesso administrativo reservado.<br/>
            D'GUSTAR & CONFEITARIA
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
