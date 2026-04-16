import React, { useState, useEffect } from 'react';
import { MENU_DATA } from './data/menu';
import { ProductCard } from '@/src/components/ProductCard';
import { CartSheet } from '@/src/components/CartSheet';
import { useCart, CartProvider } from './CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Instagram, Phone, MapPin, Clock, User, LayoutDashboard, Image as ImageIcon, LogOut } from 'lucide-react';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { SuccessPage } from './SuccessPage';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Portfolio } from './components/Portfolio';
import { auth, db, getUserRole } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

import { CheckoutModal } from '@/src/components/CheckoutModal';

import { chatWithGemini } from './lib/gemini';
import { MenuItem } from './types';

const AppContent = () => {
  const { cart, total } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [activeCategory, setActiveCategory] = useState('Doces Simples');
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_DATA);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Fallback: If email is the admin email, force admin role immediately in UI
        const userEmail = u.email?.toLowerCase();
        const isAdminByEmail = userEmail === 'vanessadgustarconfeitaria@admin.com' || 
                              userEmail === 'lbodysmodas01@gmail.com';
        
        if (isAdminByEmail) {
          setUserRole('admin');
        } else {
          const role = await getUserRole(u.uid);
          setUserRole(role);
        }
      } else {
        setUserRole('user');
      }
    });

    const fetchMenu = async () => {
      try {
        const snap = await getDocs(collection(db, 'menu'));
        if (!snap.empty) {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem));
          setMenuItems(items);
        }
      } catch (e) {
        console.error('Error fetching menu from Firestore, using fallback:', e);
      }
    };

    fetchMenu();
    return () => unsubscribe();
  }, []);

  const handleGetAiSuggestion = async () => {
    setIsAiLoading(true);
    const prompt = `Como um chef confeiteiro da D'GUSTAR & CONFEITARIA, sugira um acompanhamento ou uma combinação especial para quem gosta de ${activeCategory}. Seja breve e use um tom convidativo.`;
    const suggestion = await chatWithGemini(prompt);
    setAiSuggestion(suggestion);
    setIsAiLoading(false);
  };

  const categories = Array.from(new Set(menuItems.map((item) => item.category)));

  const filteredItems = menuItems.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#FFF5F7] font-sans text-gray-900">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-pink-100 px-4 py-2">
        <div className="max-w-5xl mx-auto flex justify-between items-center relative h-14">
          <div className="w-12 md:w-32" /> {/* Spacer for symmetry */}
          
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
            <h1 className="text-sm md:text-lg font-black tracking-tight text-pink-600 uppercase leading-none">D'GUSTAR</h1>
            <div className="flex items-center gap-1.5 py-0.5">
              <div className="h-[1px] w-4 bg-pink-200" />
              <span className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-pink-400 font-bold">CONFEITARIA</span>
              <div className="h-[1px] w-4 bg-pink-200" />
            </div>
          </div>

          <div className="flex items-center gap-1">
            {user ? (
               <div className="flex items-center gap-2">
                 {userRole === 'admin' && (
                    <Link to="/admin">
                      <Button variant="ghost" size="icon" className="text-pink-600 hover:bg-pink-50">
                        <LayoutDashboard className="w-5 h-5" />
                      </Button>
                    </Link>
                 )}
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-pink-600 hover:bg-pink-50"
                    onClick={() => auth.signOut()}
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
               </div>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-pink-600 hover:bg-pink-50"
                onClick={() => setIsAuthOpen(true)}
              >
                <User className="w-5 h-5" />
              </Button>
            )}

            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-pink-600 hover:bg-pink-50"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero / Brand Identity */}
      <section className="px-4 py-12 bg-gradient-to-b from-white to-pink-50 overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-4 border-pink-200" />
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full border-8 border-pink-100" />
        </div>

        <div className="max-w-md mx-auto text-center space-y-6 relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative inline-block"
          >
            {/* Logo Backdrop */}
            <div className="absolute inset-0 bg-pink-200/50 rounded-full blur-2xl -z-10 animate-pulse" />
            
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white flex items-center justify-center border-8 border-pink-100 shadow-2xl relative overflow-hidden group">
              <img 
                src="https://instagram.fbsb8-2.fna.fbcdn.net/v/t51.82787-19/670890316_18463978237098931_1939052380474147205_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMxIn0&_nc_ht=instagram.fbsb8-2.fna.fbcdn.net&_nc_cat=107&_nc_oc=Q6cZ2gGSQIlauX8HC4IONqw2QlhR75_ruB9XeY9RjMfQWF956GXRsSdl4RlTtIvH-qMwZlESKXIu8Ptd9-Zh0VjwCQT4&_nc_ohc=fJOjnzz8Gq4Q7kNvwERdeH5&_nc_gid=OeJ8Kj6BVrbG0JNwZRyWbQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_Af3JzXFx1kzZeCM1sD-iZqfaNjSWnubzw8rbhZEsd3k7nA&oe=69E70A05&_nc_sid=7a9f4b" 
                alt="D'GUSTAR Logo" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Arched text effect (simplified with CSS for now) */}
            <div className="absolute -top-4 -left-4 -right-4 -bottom-4 border-2 border-dashed border-pink-200 rounded-full animate-[spin_20s_linear_infinite]" />
          </motion.div>

          <div className="space-y-2">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-black text-pink-800 tracking-tighter"
            >
              D'GUSTAR
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 text-pink-400 font-bold tracking-widest text-xs uppercase"
            >
              <div className="h-[1px] w-6 bg-pink-200" />
              CONFEITARIA
              <div className="h-[1px] w-6 bg-pink-200" />
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-pink-600/70 font-medium max-w-[280px] mx-auto leading-relaxed"
            >
              Bolos, Salgados & Doces artesanais feitos com carinho para seus momentos especiais.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <div className="sticky top-[61px] z-30 bg-white/90 backdrop-blur-sm border-b border-pink-50 py-3 overflow-x-auto no-scrollbar">
        <div className="flex px-4 gap-2 min-w-max">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              className={`rounded-full px-6 transition-all ${
                activeCategory === cat 
                ? 'bg-pink-500 hover:bg-pink-600 text-white border-none shadow-md' 
                : 'border-pink-200 text-pink-600 hover:bg-pink-50'
              }`}
              onClick={() => {
                setActiveCategory(cat);
                setAiSuggestion(null);
              }}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* AI Suggestion Section */}
      <div className="max-w-5xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                <span className="text-lg">✨</span>
              </div>
              <h3 className="font-bold text-pink-800">Dica da Chef (IA)</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleGetAiSuggestion}
              disabled={isAiLoading}
              className="text-pink-600 hover:bg-pink-50"
            >
              {isAiLoading ? 'Pensando...' : 'Pedir Sugestão'}
            </Button>
          </div>
          {aiSuggestion && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-gray-600 italic leading-relaxed"
            >
              "{aiSuggestion}"
            </motion.p>
          )}
        </div>
      </div>

      {/* Menu Grid */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredItems.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="bg-white border-t border-pink-100 px-6 py-12 mt-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-pink-800 uppercase tracking-wider">Informações</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-pink-500 shrink-0" />
                <p>Rua Primeiro de Maio, 294, Santa Cruz<br />CEP: 41925-050, Salvador - BA</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-pink-500 shrink-0" />
                <p>71 98367-6361 / 71 98717-8771</p>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-pink-500 shrink-0" />
                <p>Pedidos de kits e bolos temáticos com no mínimo 7 dias de antecedência.</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-pink-800 uppercase tracking-wider">Redes Sociais</h3>
            <div className="flex gap-4">
              <Link to="/portfolio">
                <Button variant="outline" size="icon" className="rounded-full border-pink-200 text-pink-600 hover:bg-pink-50">
                  <ImageIcon className="w-5 h-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full border-pink-200 text-pink-600 hover:bg-pink-50"
                onClick={() => window.open('https://www.instagram.com/dgustar_confeitariagourmet/', '_blank')}
              >
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-pink-200 text-pink-600 hover:bg-pink-50">
                <Phone className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100">
              <p className="text-xs text-pink-700 font-medium">
                * Pagamento: 50% de entrada no ato do pedido e 50% na entrega.
              </p>
              <p className="text-xs text-pink-700 font-medium mt-2">
                * Entrega: Uber Entrega (por conta do cliente) ou retirada no local.
              </p>
            </div>
          </div>
        </div>
        <div className="text-center mt-12 pt-8 border-t border-pink-50 text-[10px] text-gray-400 uppercase tracking-widest">
          © 2024 D'GUSTAR & CONFEITARIA - Todos os direitos reservados
        </div>
      </footer>

      {/* Cart Sheet */}
      <CartSheet 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />

      {/* Floating Cart Button (Mobile) */}
      {cart.length > 0 && !isCartOpen && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 z-50 md:hidden"
        >
          <Button 
            onClick={() => setIsCartOpen(true)}
            className="w-16 h-16 rounded-full bg-pink-500 hover:bg-pink-600 shadow-2xl flex flex-col items-center justify-center p-0"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="text-[10px] font-bold">R$ {total.toFixed(0)}</span>
          </Button>
        </motion.div>
      )}
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <CartProvider>
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/portfolio" element={<Portfolio />} />
        </Routes>
      </CartProvider>
    </Router>
  );
}
