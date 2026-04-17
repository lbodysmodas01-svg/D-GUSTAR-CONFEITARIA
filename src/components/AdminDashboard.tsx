import React, { useState, useEffect } from 'react';
import { db, auth, getUserRole } from '../firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  setDoc,
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MenuItem } from '../types';
import { 
  LogOut, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Image as ImageIcon, 
  Settings, 
  Users,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [activeTab, setActiveTab] = useState('menu');

  const palettes = ['pink', 'blue', 'violet', 'emerald', 'orange', 'rose'];

  // Settings State
  const [appLogoUrl, setAppLogoUrl] = useState('');
  const [appName, setAppName] = useState('');
  const [appSubtitle, setAppSubtitle] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [colorPalette, setColorPalette] = useState('pink');

  // Users State
  const [usersList, setUsersList] = useState<any[]>([]);
  
  // Orders & Analytics State
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [orderFilter, setOrderFilter] = useState('all');
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [yearlyData, setYearlyData] = useState<any[]>([]);

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
    
    // Fetch Settings
    const settingsSnap = await getDoc(doc(db, 'settings', 'brand'));
    if (settingsSnap.exists() && settingsSnap.data()) {
      const data = settingsSnap.data();
      if(data.logoUrl) setAppLogoUrl(data.logoUrl);
      if(data.appName) setAppName(data.appName);
      if(data.appSubtitle) setAppSubtitle(data.appSubtitle);
      if(data.appDescription) setAppDescription(data.appDescription);
      if(data.colorPalette) setColorPalette(data.colorPalette);
    }

    // Fetch Users
    const usersSnap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
    setUsersList(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    // Fetch Orders
    const ordersSnap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
    const orders = ordersSnap.docs.map(d => ({ 
      id: d.id, 
      ...d.data(),
      createdAt: d.data().createdAt?.toDate() || new Date()
    }));
    setOrdersList(orders);
    processAnalytics(orders);
  };

  const processAnalytics = (orders: any[]) => {
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    
    // Monthly Data (Last 6-12 months)
    const monthlyMap: Record<string, number> = {};
    const yearlyMap: Record<string, number> = {};

    orders.forEach(order => {
      const date = order.createdAt;
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      const yearKey = `${date.getFullYear()}`;
      
      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + (order.total || 0);
      yearlyMap[yearKey] = (yearlyMap[yearKey] || 0) + (order.total || 0);
    });

    const monthlyFormatted = Object.entries(monthlyMap).map(([name, total]) => ({ name, total }));
    const yearlyFormatted = Object.entries(yearlyMap).map(([year, total]) => ({ year, total }));

    setAnalyticsData(monthlyFormatted.reverse().slice(0, 12).reverse());
    setYearlyData(yearlyFormatted);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast.success('Status do pedido atualizado!');
      fetchData();
    } catch (e) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to compress picture
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert back to base64
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setAppLogoUrl(dataUrl);
      };
      
      if(typeof event.target?.result === 'string') {
         img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'brand'), {
        logoUrl: appLogoUrl,
        appName,
        appSubtitle,
        appDescription,
        colorPalette,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast.success('Configurações atualizadas com sucesso!');
    } catch (err: any) {
      console.error('Settings save error:', err);
      toast.error('Erro ao atualizar configurações: ' + (err.message || ''));
    }
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-6 mb-8 gap-2 bg-transparent h-auto">
            <TabsTrigger value="menu" className="bg-white data-[state=active]:bg-pink-600 data-[state=active]:text-white shadow-sm border">Cardápio</TabsTrigger>
            <TabsTrigger value="portfolio" className="bg-white data-[state=active]:bg-pink-600 data-[state=active]:text-white shadow-sm border">Instagram</TabsTrigger>
            <TabsTrigger value="orders" className="bg-white data-[state=active]:bg-pink-600 data-[state=active]:text-white shadow-sm border text-xs">Histórico Pedidos</TabsTrigger>
            <TabsTrigger value="analytics" className="bg-white data-[state=active]:bg-pink-600 data-[state=active]:text-white shadow-sm border">Gráficos</TabsTrigger>
            <TabsTrigger value="users" className="bg-white data-[state=active]:bg-pink-600 data-[state=active]:text-white shadow-sm border">Clientes</TabsTrigger>
            <TabsTrigger value="settings" className="bg-white data-[state=active]:bg-pink-600 data-[state=active]:text-white shadow-sm border">Configurações</TabsTrigger>
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

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5"/> Aparência & Textos</CardTitle>
                <CardDescription>Personalize os textos principais e a logomarca do seu aplicativo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                
                {/* Logo Section */}
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start border-b pb-8">
                  <div className="flex flex-col items-center space-y-4">
                     <p className="text-sm font-medium text-gray-500">Logo Atual</p>
                     <div className="w-32 h-32 rounded-full border-4 border-pink-100 shadow-md overflow-hidden bg-pink-50 flex items-center justify-center">
                        {appLogoUrl ? (
                           <img src={appLogoUrl} className="w-full h-full object-cover" alt="Preview"/>
                        ) : (
                           <ImageIcon className="w-8 h-8 text-pink-300"/>
                        )}
                     </div>
                  </div>
                  <div className="flex-1 space-y-4 w-full">
                     <div className="space-y-2">
                       <Label>Fazer Upload da Imagem do Perfil</Label>
                       <Input type="file" accept="image/*" onChange={handleLogoUpload} className="cursor-pointer" />
                     </div>
                     <div className="space-y-2">
                       <Label>Ou informe o Link/URL da Imagem</Label>
                       <Input value={appLogoUrl} onChange={(e) => setAppLogoUrl(e.target.value)} placeholder="https://..." />
                     </div>
                  </div>
                </div>

                {/* Texts Section */}
                <div className="space-y-4">
                   <h3 className="text-lg font-semibold text-gray-800">Textos do Aplicativo</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label>Nome Principal (Ex: D'GUSTAR)</Label>
                       <Input 
                         value={appName} 
                         onChange={(e) => setAppName(e.target.value)} 
                         placeholder="Nome da marca" 
                       />
                     </div>
                     <div className="space-y-2">
                       <Label>Subtítulo (Ex: CONFEITARIA)</Label>
                       <Input 
                         value={appSubtitle} 
                         onChange={(e) => setAppSubtitle(e.target.value)} 
                         placeholder="Segmento" 
                       />
                     </div>
                   </div>
                   <div className="space-y-2">
                     <Label>Descrição Curta</Label>
                     <Input 
                       value={appDescription} 
                       onChange={(e) => setAppDescription(e.target.value)} 
                       placeholder="Bolos, Salgados & Doces..." 
                     />
                   </div>
                   <div className="space-y-2 pt-4 border-t">
                     <Label>Cor Padrão / Tema</Label>
                     <div className="flex flex-wrap gap-3 mt-2">
                        {[
                          { id: 'pink', hex: '#ec4899' },
                          { id: 'blue', hex: '#3b82f6' },
                          { id: 'violet', hex: '#8b5cf6' },
                          { id: 'emerald', hex: '#10b981' },
                          { id: 'orange', hex: '#f97316' },
                          { id: 'rose', hex: '#f43f5e' }
                        ].map(color => (
                          <button
                            key={color.id}
                            onClick={() => setColorPalette(color.id)}
                            className={`w-10 h-10 rounded-full transition-transform outline-offset-2 ${
                              colorPalette === color.id ? 'scale-110 outline outline-2 outline-gray-400' : 'hover:scale-105'
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.id}
                          />
                        ))}
                     </div>
                   </div>
                </div>

                <Button className="w-full bg-pink-600 hover:bg-pink-700 h-12 text-md" onClick={handleSaveSettings}>
                  <Save className="w-5 h-5 mr-2" /> Salvar Todas as Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                 <h2 className="text-2xl font-bold text-gray-800">Histórico de Pedidos</h2>
                 <p className="text-gray-500 text-sm">Acompanhe todos os pedidos realizados no aplicativo.</p>
               </div>
               <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
                  {['all', 'pending', 'confirmed', 'delivered', 'cancelled'].map(f => (
                    <button
                      key={f}
                      onClick={() => setOrderFilter(f)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                        orderFilter === f ? 'bg-pink-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendentes' : f === 'confirmed' ? 'Confirmados' : f === 'delivered' ? 'Entregues' : 'Cancelados'}
                    </button>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {ordersList
                .filter(o => orderFilter === 'all' || o.status === orderFilter)
                .length === 0 ? (
                  <Card className="p-12 text-center text-gray-500 italic">Nenhum pedido encontrado para este filtro.</Card>
                ) : (
                  ordersList
                    .filter(o => orderFilter === 'all' || o.status === orderFilter)
                    .map((order) => (
                      <Card key={order.id} className="overflow-hidden border-l-4 border-l-pink-500">
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x">
                             <div className="p-4 md:w-1/4 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-gray-400">ORDEM #{order.orderId}</span>
                                  <Badge className={
                                    order.status === 'confirmed' ? 'bg-blue-500' : 
                                    order.status === 'delivered' ? 'bg-green-500' : 
                                    order.status === 'cancelled' ? 'bg-red-500' : 'bg-orange-500'
                                  }>
                                    {order.status === 'confirmed' ? 'Confirmado' : 
                                     order.status === 'delivered' ? 'Entregue' : 
                                     order.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                                  </Badge>
                                </div>
                                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                  <Users className="w-4 h-4 text-pink-400" /> {order.customerName}
                                </h4>
                                <div className="text-xs text-gray-500 space-y-1">
                                  <p className="flex items-center gap-2"><Clock className="w-3 h-3" /> {order.createdAt.toLocaleString('pt-BR')}</p>
                                  <p className="flex items-center gap-2 font-medium text-pink-600">Total: R$ {order.total.toFixed(2)}</p>
                                </div>
                             </div>
                             <div className="p-4 md:flex-grow flex flex-col justify-center">
                                <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Itens</p>
                                <div className="space-y-1">
                                   {order.items.map((it: any, idx: number) => (
                                      <p key={idx} className="text-sm text-gray-600">
                                        <span className="font-bold">{it.quantity}x</span> {it.name} 
                                        {it.selectedMassa && <span className="text-[10px] text-gray-400 ml-2">({it.selectedMassa}/{it.selectedRecheio})</span>}
                                      </p>
                                   ))}
                                </div>
                             </div>
                             <div className="p-4 md:w-1/4 flex flex-col justify-between gap-4 bg-gray-50/50">
                                <div className="space-y-2">
                                   <Label className="text-[10px] uppercase text-gray-400 font-bold">Mudar Status</Label>
                                   <div className="grid grid-cols-2 gap-1">
                                      <Button variant="outline" size="sm" className="h-7 text-[10px] px-1" onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}>Confirmar</Button>
                                      <Button variant="outline" size="sm" className="h-7 text-[10px] px-1" onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}>Entregar</Button>
                                      <Button variant="outline" size="sm" className="h-7 text-[10px] px-1" onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}>Cancelar</Button>
                                   </div>
                                </div>
                                <Button variant="ghost" size="sm" className="w-full text-xs h-8 text-pink-600" onClick={() => {
                                   let report = `*Relatório Pedido #${order.orderId}*\n\n`;
                                   report += `Cliente: ${order.customerName}\nTotal: R$ ${order.total.toFixed(2)}\n\nItens:\n`;
                                   order.items.forEach((it: any) => { report += `• ${it.quantity}x ${it.name}\n`; });
                                   navigator.clipboard.writeText(report);
                                   toast.success('Relatório copiado para a área de transferência!');
                                }}>
                                   <FileText className="w-3 h-3 mr-1" /> Gerar Relatório
                                </Button>
                             </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-pink-200 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-pink-100 text-xs font-bold uppercase tracking-wider">Vendas Totais</p>
                        <h3 className="text-3xl font-black mt-1">R$ {ordersList.reduce((acc, current) => acc + (current.total || 0), 0).toFixed(2)}</h3>
                      </div>
                      <div className="bg-white/20 p-2 rounded-lg">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
               </Card>
               <Card className="shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider font-mono">Total Pedidos</p>
                        <h3 className="text-3xl font-black mt-1 text-gray-800">{ordersList.length}</h3>
                      </div>
                      <div className="bg-pink-100 p-2 rounded-lg text-pink-600">
                        <BarChart3 className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
               </Card>
               <Card className="shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider font-mono">Ticket Médio</p>
                        <h3 className="text-3xl font-black mt-1 text-gray-800">
                          R$ {ordersList.length > 0 ? (ordersList.reduce((acc, current) => acc + (current.total || 0), 0) / ordersList.length).toFixed(2) : '0.00'}
                        </h3>
                      </div>
                      <div className="bg-pink-100 p-2 rounded-lg text-pink-600">
                        <TrendingUp className="w-6 h-6 ml-auto" />
                      </div>
                    </div>
                  </CardContent>
               </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <Card className="shadow-md">
                 <CardHeader>
                   <CardTitle className="text-lg">Desenvolvimento Mensal (Faturamento)</CardTitle>
                   <CardDescription>Visualização dos últimos meses</CardDescription>
                 </CardHeader>
                 <CardContent className="h-[300px] w-full pt-4">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={analyticsData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                       <Tooltip 
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                         labelStyle={{ fontWeight: 'bold', color: '#ec4899' }}
                       />
                       <Bar dataKey="total" fill="#ec4899" radius={[4, 4, 0, 0]} />
                     </BarChart>
                   </ResponsiveContainer>
                 </CardContent>
               </Card>

               <Card className="shadow-md">
                 <CardHeader>
                   <CardTitle className="text-lg">Crescimento Anual</CardTitle>
                   <CardDescription>Resumo de faturamento por ano</CardDescription>
                 </CardHeader>
                 <CardContent className="h-[300px] w-full pt-4">
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={yearlyData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                       <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                       <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                       />
                       <Line type="monotone" dataKey="total" stroke="#ec4899" strokeWidth={3} dot={{ r: 6, fill: '#ec4899' }} />
                     </LineChart>
                   </ResponsiveContainer>
                 </CardContent>
               </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5"/> Banco de Clientes</CardTitle>
                <CardDescription>Lista de todos os clientes cadastrados no aplicativo.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {usersList.length === 0 ? (
                    <p className="text-gray-500 italic p-4 text-center col-span-full">Nenhum cliente cadastrado ainda.</p>
                  ) : (
                    usersList.map((u) => (
                      <div key={u.id} className="border border-gray-100 bg-white shadow-sm p-4 rounded-xl flex flex-col gap-2">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-2">
                           <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold uppercase">
                             {u.name ? u.name.charAt(0) : '?'}
                           </div>
                           <div>
                             <h4 className="font-bold text-gray-800">{u.name || 'Sem Nome'}</h4>
                             <p className="text-xs text-gray-400 capitalize">{u.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
                           </div>
                        </div>
                        <div className="space-y-1 text-sm mt-1">
                          <p><span className="font-semibold text-gray-600">Email:</span> {u.email}</p>
                          <p><span className="font-semibold text-gray-600">Telefone:</span> {u.phone || 'Não informado'}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
