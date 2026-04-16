import React, { useState, useEffect } from 'react';
import { db, auth, getUserRole } from '../firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { MenuItem } from '../types';
import { LogOut, Plus, Trash2, Edit2, Save, X, Image as ImageIcon } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    category: '',
    price: 0,
    unit: '',
  });

  const [portfolioPosts, setPortfolioPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState({ imageUrl: '', instagramLink: '', description: '' });

  useEffect(() => {
    const checkAdmin = async () => {
      if (auth.currentUser) {
        const role = await getUserRole(auth.currentUser.uid);
        if (role === 'admin') {
          setIsAdmin(true);
          fetchData();
        } else {
          window.location.href = '/';
        }
      } else {
        window.location.href = '/';
      }
      setLoading(false);
    };
    checkAdmin();
  }, []);

  const fetchData = async () => {
    // Fetch Menu
    const menuSnap = await getDocs(collection(db, 'menu'));
    const items = menuSnap.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem));
    setMenuItems(items);

    // Fetch Portfolio
    const portfolioSnap = await getDocs(query(collection(db, 'portfolio'), orderBy('createdAt', 'desc')));
    setPortfolioPosts(portfolioSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleUpdateItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      await updateDoc(doc(db, 'menu', id), updates);
      toast.success('Item atualizado!');
      setEditingItem(null);
      fetchData();
    } catch (e) {
      toast.error('Erro ao atualizar item');
    }
  };

  const handleAddItem = async () => {
    try {
      await addDoc(collection(db, 'menu'), newItem);
      toast.success('Item adicionado!');
      setNewItem({ name: '', category: '', price: 0, unit: '' });
      fetchData();
    } catch (e) {
      toast.error('Erro ao adicionar item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Deseja excluir este item?')) {
      await deleteDoc(doc(db, 'menu', id));
      toast.success('Item excluído');
      fetchData();
    }
  };

  const handleAddPost = async () => {
    try {
      await addDoc(collection(db, 'portfolio'), {
        ...newPost,
        createdAt: serverTimestamp()
      });
      toast.success('Post adicionado ao portfólio!');
      setNewPost({ imageUrl: '', instagramLink: '', description: '' });
      fetchData();
    } catch (e) {
      toast.error('Erro ao adicionar post');
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando painel...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Painel Administrativo</h1>
            <p className="text-gray-500">Gerencie seu cardápio e portfólio</p>
          </div>
          <Button variant="outline" onClick={() => auth.signOut()}>
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </header>

        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="menu">Cardápio</TabsTrigger>
            <TabsTrigger value="portfolio">Portfólio (Instagram)</TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Novo Item</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Preço (R$)</Label>
                  <Input type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value)})} />
                </div>
                <Button className="bg-pink-600 hover:bg-pink-700" onClick={handleAddItem}>
                  <Plus className="w-4 h-4 mr-2" /> Adicionar
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              {menuItems.map(item => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    {editingItem?.id === item.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-grow">
                        <Input value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} />
                        <Input value={editingItem.category} onChange={e => setEditingItem({...editingItem, category: e.target.value})} />
                        <Input type="number" value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: parseFloat(e.target.value)})} />
                      </div>
                    ) : (
                      <div className="text-left flex-grow">
                        <h4 className="font-bold text-lg text-gray-800">{item.name}</h4>
                        <p className="text-sm text-pink-500 font-medium">{item.category} • R$ {item.price.toFixed(2)}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {editingItem?.id === item.id ? (
                        <>
                          <Button size="sm" onClick={() => handleUpdateItem(item.id, editingItem)}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingItem(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => setEditingItem(item)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteItem(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Post do Portfólio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>URL da Imagem</Label>
                    <Input value={newPost.imageUrl} placeholder="https://..." onChange={e => setNewPost({...newPost, imageUrl: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Link do Instagram</Label>
                    <Input value={newPost.instagramLink} placeholder="https://instagram.com/p/..." onChange={e => setNewPost({...newPost, instagramLink: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input value={newPost.description} onChange={e => setNewPost({...newPost, description: e.target.value})} />
                </div>
                <Button className="w-full bg-pink-600 hover:bg-pink-700" onClick={handleAddPost}>
                  <ImageIcon className="w-4 h-4 mr-2" /> Publicar no Portfólio
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {portfolioPosts.map(post => (
                <div key={post.id} className="group relative rounded-xl overflow-hidden aspect-square shadow-sm">
                  <img src={post.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="sm" variant="destructive" onClick={async () => {
                      if(confirm('Remover do portfólio?')) {
                        await deleteDoc(doc(db, 'portfolio', post.id));
                        fetchData();
                      }
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
